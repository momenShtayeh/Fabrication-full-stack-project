package org.example.ccc_fs_a.batch;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.example.ccc_fs_a.common.exception.ResourceNotFoundException;
import org.example.ccc_fs_a.iso.IsoStatus;
import org.example.ccc_fs_a.spool.Spool;
import org.example.ccc_fs_a.spool.SpoolMaterial;
import org.example.ccc_fs_a.spool.SpoolMaterialRepository;
import org.example.ccc_fs_a.spool.SpoolRepository;
import org.example.ccc_fs_a.spool.SpoolStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class BatchService {

    private static final DateTimeFormatter BATCH_NO_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss-SSS");

    private final BatchRepository batchRepository;
    private final BatchSpoolRepository batchSpoolRepository;
    private final BatchSkippedSpoolRepository batchSkippedSpoolRepository;
    private final SpoolRepository spoolRepository;
    private final SpoolMaterialRepository spoolMaterialRepository;

    public BatchService(BatchRepository batchRepository,
                        BatchSpoolRepository batchSpoolRepository,
                        BatchSkippedSpoolRepository batchSkippedSpoolRepository,
                        SpoolRepository spoolRepository,
                        SpoolMaterialRepository spoolMaterialRepository) {
        this.batchRepository = batchRepository;
        this.batchSpoolRepository = batchSpoolRepository;
        this.batchSkippedSpoolRepository = batchSkippedSpoolRepository;
        this.spoolRepository = spoolRepository;
        this.spoolMaterialRepository = spoolMaterialRepository;
    }

    public Page<BatchResponse> getAll(Pageable pageable) {
        return batchRepository.findAll(pageable).map(BatchResponse::from);
    }

    //the batch with its report; batched spools are locked, so their requirements still show what the batch took
    public BatchDetailResponse getById(Long id) {
        Batch batch = findBatch(id);
        List<Spool> spools = findSpoolsOf(batch);
        List<SkippedSpoolResponse> skippedSpools = batchSkippedSpoolRepository.findByBatchIdOrderByIdAsc(id).stream()
                .map(SkippedSpoolResponse::from)
                .toList();
        return BatchDetailResponse.from(batch, spools, MaterialUsageResponse.sumOf(findRequirementsOf(spools)), skippedSpools);
    }

    /*
     * Goes through every spool that is not batched yet, oldest first, and only batches spools of VERIFIED isos,
     * as a drawing still being verified may change. A spool whose required materials are all in stock is added
     * to the batch and its materials are deducted, so later spools only see what is left; a spool short of any
     * material becomes PENDING_MATERIAL. Every spool left out is reported with the reason, and the report is saved
     * with the batch. Runs in one transaction: if anything fails, no stock is deducted and no batch is created.
     */
    @Transactional
    public BatchGenerationResponse generate() {
        List<Spool> candidates = spoolRepository.findByStatusInOrderByIdAsc(
                List.of(SpoolStatus.NEW, SpoolStatus.PENDING_MATERIAL));
        Map<Long, List<SpoolMaterial>> requirementsBySpoolId = findRequirementsBySpoolId(candidates.stream()
                .filter(this::isReleasedForFabrication)
                .toList());

        List<Spool> batchedSpools = new ArrayList<>();
        List<SpoolMaterial> usedRequirements = new ArrayList<>();
        List<SkippedSpool> skippedSpools = new ArrayList<>();

        for (Spool spool : candidates) {
            if (!isReleasedForFabrication(spool)) {
                skippedSpools.add(new SkippedSpool(spool, SkipReason.ISO_NOT_VERIFIED, List.of()));
                continue;
            }

            List<SpoolMaterial> requirements = requirementsBySpoolId.getOrDefault(spool.getId(), List.of());
            if (requirements.isEmpty()) {
                skippedSpools.add(new SkippedSpool(spool, SkipReason.NO_MATERIALS, List.of()));
                continue;
            }

            List<MaterialShortage> shortages = findShortages(requirements);
            if (shortages.isEmpty()) {
                requirements.forEach(requirement ->
                        requirement.getMaterial().deductStock(requirement.getQtyRequired()));
                spool.setStatus(SpoolStatus.BATCHED);
                batchedSpools.add(spool);
                usedRequirements.addAll(requirements);
            } else {
                spool.setStatus(SpoolStatus.PENDING_MATERIAL);
                skippedSpools.add(new SkippedSpool(spool, SkipReason.MATERIAL_SHORTAGE, shortages));
            }
        }

        List<SkippedSpoolResponse> skippedResponses = skippedSpools.stream()
                .map(skipped -> SkippedSpoolResponse.from(skipped.spool(), skipped.reason(), skipped.shortages()))
                .toList();
        if (batchedSpools.isEmpty()) {
            return new BatchGenerationResponse(null, skippedResponses);
        }

        Batch batch = batchRepository.save(new Batch(generateBatchNo()));
        batchSpoolRepository.saveAll(batchedSpools.stream()
                .map(spool -> new BatchSpool(batch, spool))
                .toList());
        batchSkippedSpoolRepository.saveAll(skippedSpools.stream()
                .map(skipped -> new BatchSkippedSpool(batch, skipped.spool(), skipped.reason(), skipped.shortages()))
                .toList());

        BatchDetailResponse batchResponse = BatchDetailResponse.from(
                batch, batchedSpools, MaterialUsageResponse.sumOf(usedRequirements), skippedResponses);
        return new BatchGenerationResponse(batchResponse, skippedResponses);
    }

    //cancels a batch: its spools go back to NEW and their materials are returned to stock; its report is deleted with it
    @Transactional
    public void delete(Long id) {
        Batch batch = findBatch(id);
        List<BatchSpool> batchSpools = batchSpoolRepository.findByBatchIdOrderByIdAsc(id);
        List<Spool> spools = batchSpools.stream().map(BatchSpool::getSpool).toList();

        findRequirementsOf(spools)
                .forEach(requirement -> requirement.getMaterial().addStock(requirement.getQtyRequired()));
        spools.forEach(spool -> spool.setStatus(SpoolStatus.NEW));

        batchSpoolRepository.deleteAll(batchSpools);
        batchRepository.delete(batch);
        releaseResolvedPendingSpools();
    }

    /*
     * A spool is often pending only because a batched spool took the stock first. Once a cancelled batch returns
     * that stock, pending spools whose materials are all in stock again go back to NEW, the ones still short stay
     * pending. Each spool is checked on its own, the next batch generation decides which of them really get the stock.
     */
    private void releaseResolvedPendingSpools() {
        List<Spool> pendingSpools = spoolRepository.findByStatusInOrderByIdAsc(List.of(SpoolStatus.PENDING_MATERIAL));
        if (pendingSpools.isEmpty()) {
            return;
        }

        Map<Long, List<SpoolMaterial>> requirementsBySpoolId = findRequirementsBySpoolId(pendingSpools);
        pendingSpools.stream()
                .filter(spool -> findShortages(requirementsBySpoolId.getOrDefault(spool.getId(), List.of())).isEmpty())
                .forEach(spool -> spool.setStatus(SpoolStatus.NEW));
    }

    private boolean isReleasedForFabrication(Spool spool) {
        return spool.getIso().getStatus() == IsoStatus.VERIFIED;
    }

    private Batch findBatch(Long id) {
        return batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch with id " + id + " not found"));
    }

    private List<Spool> findSpoolsOf(Batch batch) {
        return batchSpoolRepository.findByBatchIdOrderByIdAsc(batch.getId()).stream()
                .map(BatchSpool::getSpool)
                .toList();
    }

    //loads the requirements of all the spools in one query instead of one query per spool
    private List<SpoolMaterial> findRequirementsOf(List<Spool> spools) {
        if (spools.isEmpty()) {
            return List.of();
        }
        return spoolMaterialRepository.findBySpoolIdIn(spools.stream().map(Spool::getId).toList());
    }

    private Map<Long, List<SpoolMaterial>> findRequirementsBySpoolId(List<Spool> spools) {
        return findRequirementsOf(spools).stream()
                .collect(Collectors.groupingBy(requirement -> requirement.getSpool().getId()));
    }

    private List<MaterialShortage> findShortages(List<SpoolMaterial> requirements) {
        return requirements.stream()
                .filter(requirement -> requirement.getMaterial().getQuantity() < requirement.getQtyRequired())
                .map(requirement -> new MaterialShortage(
                        requirement.getMaterial().getCode(),
                        requirement.getQtyRequired(),
                        requirement.getMaterial().getQuantity()))
                .toList();
    }

    private String generateBatchNo() {
        return "BATCH-" + LocalDateTime.now().format(BATCH_NO_FORMAT);
    }

    //a spool left out of the batch being generated, before it is turned into a response or saved in the report
    private record SkippedSpool(Spool spool, SkipReason reason, List<MaterialShortage> shortages) {
    }
}
