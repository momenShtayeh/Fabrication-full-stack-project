package org.example.ccc_fs_a.spool;

import org.example.ccc_fs_a.common.exception.BusinessRuleException;
import org.example.ccc_fs_a.common.exception.DuplicateResourceException;
import org.example.ccc_fs_a.common.exception.ResourceNotFoundException;
import org.example.ccc_fs_a.iso.Iso;
import org.example.ccc_fs_a.iso.IsoService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SpoolService {

    private final SpoolRepository spoolRepository;
    private final IsoService isoService;

    public SpoolService(SpoolRepository spoolRepository, IsoService isoService) {
        this.spoolRepository = spoolRepository;
        this.isoService = isoService;
    }

    public Page<SpoolResponse> getByIso(Long isoId, Pageable pageable) {
        isoService.findIso(isoId);
        return spoolRepository.findByIsoId(isoId, pageable).map(SpoolResponse::from);
    }

    //status is optional, e.g. status=PENDING_MATERIAL lists the spools that could not be batched
    public Page<SpoolResponse> search(String search, SpoolStatus status, Pageable pageable) {
        Page<Spool> spools = status == null
                ? spoolRepository.findBySpoolNoContainingIgnoreCase(search.trim(), pageable)
                : spoolRepository.findByStatusAndSpoolNoContainingIgnoreCase(status, search.trim(), pageable);
        return spools.map(SpoolResponse::from);
    }

    public SpoolResponse getById(Long id) {
        return SpoolResponse.from(findSpool(id));
    }

    @Transactional
    public SpoolResponse create(Long isoId, SpoolRequest request) {
        Iso iso = isoService.findIso(isoId);
        ensureSpoolNoIsUnique(isoId, request.spoolNo());

        Spool spool = new Spool(request.spoolNo(), iso);
        return SpoolResponse.from(spoolRepository.save(spool));
    }

    @Transactional
    public SpoolResponse update(Long id, SpoolRequest request) {
        Spool spool = findSpool(id);
        if (!spool.getSpoolNo().equals(request.spoolNo())) {
            ensureSpoolNoIsUnique(spool.getIso().getId(), request.spoolNo());
        }

        spool.setSpoolNo(request.spoolNo());
        return SpoolResponse.from(spool);
    }

    //the database cascades the delete to the spool's material requirements
    @Transactional
    public void delete(Long id) {
        Spool spool = findSpool(id);
        ensureNotBatched(spool);
        spoolRepository.delete(spool);
    }

    Spool findSpool(Long id) {
        return spoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spool with id " + id + " not found"));
    }

    //a batched spool already had its stock deducted, changing it would make the stock numbers wrong
    void ensureNotBatched(Spool spool) {
        if (spool.getStatus() == SpoolStatus.BATCHED) {
            throw new BusinessRuleException("Spool '" + spool.getSpoolNo() + "' is already batched and cannot be changed");
        }
    }

    private void ensureSpoolNoIsUnique(Long isoId, String spoolNo) {
        if (spoolRepository.existsByIsoIdAndSpoolNo(isoId, spoolNo)) {
            throw new DuplicateResourceException("Spool '" + spoolNo + "' already exists in this ISO");
        }
    }
}
