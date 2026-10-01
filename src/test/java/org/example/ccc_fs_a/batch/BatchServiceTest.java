package org.example.ccc_fs_a.batch;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.example.ccc_fs_a.iso.Iso;
import org.example.ccc_fs_a.iso.IsoStatus;
import org.example.ccc_fs_a.material.Material;
import org.example.ccc_fs_a.spool.Spool;
import org.example.ccc_fs_a.spool.SpoolMaterial;
import org.example.ccc_fs_a.spool.SpoolMaterialRepository;
import org.example.ccc_fs_a.spool.SpoolRepository;
import org.example.ccc_fs_a.spool.SpoolResponse;
import org.example.ccc_fs_a.spool.SpoolStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

//unit test: the repositories are mocks, so no database or spring context is needed and the tests run in milliseconds
@ExtendWith(MockitoExtension.class)
class BatchServiceTest {

    @Mock
    private BatchRepository batchRepository;

    @Mock
    private BatchSpoolRepository batchSpoolRepository;

    @Mock
    private BatchSkippedSpoolRepository batchSkippedSpoolRepository;

    @Mock
    private SpoolRepository spoolRepository;

    @Mock
    private SpoolMaterialRepository spoolMaterialRepository;

    @InjectMocks
    private BatchService batchService;

    private final Iso iso = new Iso("ISO-1001", "A", IsoStatus.VERIFIED);
    private final Material pipe = new Material("PIPE", "Pipe", 10);
    private final Material flange = new Material("FLANGE", "Flange", 2);

    @Test
    void generate_batchesSpoolAndDeductsStock_whenAllMaterialsAreAvailable() {
        Spool spool = spool(1L, "SP-01");
        givenCandidates(spool);
        givenRequirements(requirement(spool, pipe, 6), requirement(spool, flange, 2));
        givenBatchSaveReturnsBatch();

        BatchGenerationResponse response = batchService.generate();

        assertThat(response.batch().spools()).extracting(SpoolResponse::spoolNo).containsExactly("SP-01");
        assertThat(response.batch().materialsUsed()).containsExactlyInAnyOrder(
                new MaterialUsageResponse("PIPE", "Pipe", 6), new MaterialUsageResponse("FLANGE", "Flange", 2));
        assertThat(response.skippedSpools()).isEmpty();
        assertThat(spool.getStatus()).isEqualTo(SpoolStatus.BATCHED);
        assertThat(pipe.getQuantity()).isEqualTo(4);
        assertThat(flange.getQuantity()).isZero();
        verify(batchSpoolRepository).saveAll(anyList());
    }

    @Test
    void generate_marksSpoolPendingAndKeepsAllStock_whenAnyMaterialIsShort() {
        Spool spool = spool(1L, "SP-01");
        givenCandidates(spool);
        givenRequirements(requirement(spool, pipe, 6), requirement(spool, flange, 3));

        BatchGenerationResponse response = batchService.generate();

        assertThat(response.batch()).isNull();
        assertThat(response.skippedSpools()).singleElement().satisfies(skipped -> {
            assertThat(skipped.spoolNo()).isEqualTo("SP-01");
            assertThat(skipped.reason()).isEqualTo(SkipReason.MATERIAL_SHORTAGE);
            assertThat(skipped.shortages()).containsExactly(new MaterialShortage("FLANGE", 3, 2));
        });
        assertThat(spool.getStatus()).isEqualTo(SpoolStatus.PENDING_MATERIAL);
        //the pipe was available, but a spool is batched all or nothing, so none of it is taken
        assertThat(pipe.getQuantity()).isEqualTo(10);
        verify(batchRepository, never()).save(any());
    }

    @Test
    void generate_givesStockToOlderSpoolsFirst() {
        Spool older = spool(1L, "SP-01");
        Spool newer = spool(2L, "SP-02");
        givenCandidates(older, newer);
        givenRequirements(requirement(older, pipe, 6), requirement(newer, pipe, 6));
        givenBatchSaveReturnsBatch();

        BatchGenerationResponse response = batchService.generate();

        assertThat(response.batch().spools()).extracting(SpoolResponse::spoolNo).containsExactly("SP-01");
        assertThat(response.skippedSpools()).singleElement().satisfies(skipped ->
                assertThat(skipped.shortages()).containsExactly(new MaterialShortage("PIPE", 6, 4)));
        assertThat(older.getStatus()).isEqualTo(SpoolStatus.BATCHED);
        assertThat(newer.getStatus()).isEqualTo(SpoolStatus.PENDING_MATERIAL);
        assertThat(pipe.getQuantity()).isEqualTo(4);
    }

    @Test
    void generate_skipsSpoolsWithoutRequiredMaterials() {
        Spool spool = spool(1L, "SP-01");
        givenCandidates(spool);
        givenRequirements();

        BatchGenerationResponse response = batchService.generate();

        assertThat(response.batch()).isNull();
        assertThat(response.skippedSpools()).singleElement()
                .extracting(SkippedSpoolResponse::reason).isEqualTo(SkipReason.NO_MATERIALS);
        assertThat(spool.getStatus()).isEqualTo(SpoolStatus.NEW);
    }

    @Test
    void generate_leavesSpoolsOfIsosNotVerifiedUntouched() {
        Iso underVerification = new Iso("ISO-2002", "0", IsoStatus.UNDER_VERIFICATION);
        Spool spool = new Spool("SP-01", underVerification);
        ReflectionTestUtils.setField(spool, "id", 1L);
        givenCandidates(spool);

        BatchGenerationResponse response = batchService.generate();

        assertThat(response.batch()).isNull();
        assertThat(response.skippedSpools()).singleElement()
                .extracting(SkippedSpoolResponse::reason).isEqualTo(SkipReason.ISO_NOT_VERIFIED);
        assertThat(spool.getStatus()).isEqualTo(SpoolStatus.NEW);
        //its materials are never even looked at
        verify(spoolMaterialRepository, never()).findBySpoolIdIn(anyCollection());
    }

    @Test
    void generate_savesTheSpoolsLeftOutAsTheBatchReport() {
        Spool batched = spool(1L, "SP-01");
        Spool shortSpool = spool(2L, "SP-02");
        givenCandidates(batched, shortSpool);
        givenRequirements(requirement(batched, pipe, 6), requirement(shortSpool, flange, 5));
        givenBatchSaveReturnsBatch();

        batchService.generate();

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<BatchSkippedSpool>> report = ArgumentCaptor.forClass(List.class);
        verify(batchSkippedSpoolRepository).saveAll(report.capture());
        assertThat(report.getValue()).singleElement().satisfies(skipped -> {
            assertThat(skipped.getSpoolNo()).isEqualTo("SP-02");
            assertThat(skipped.getReason()).isEqualTo(SkipReason.MATERIAL_SHORTAGE);
            assertThat(skipped.getShortages()).containsExactly(new MaterialShortage("FLANGE", 5, 2));
        });
    }

    @Test
    void delete_returnsMaterialsToStockAndSpoolsToNew() {
        Batch batch = new Batch("BATCH-1");
        ReflectionTestUtils.setField(batch, "id", 5L);
        Spool spool = spool(1L, "SP-01");
        spool.setStatus(SpoolStatus.BATCHED);
        when(batchRepository.findById(5L)).thenReturn(Optional.of(batch));
        when(batchSpoolRepository.findByBatchIdOrderByIdAsc(5L)).thenReturn(List.of(new BatchSpool(batch, spool)));
        givenRequirements(requirement(spool, pipe, 6));

        batchService.delete(5L);

        assertThat(pipe.getQuantity()).isEqualTo(16);
        assertThat(spool.getStatus()).isEqualTo(SpoolStatus.NEW);
        verify(batchRepository).delete(batch);
    }

    @Test
    void delete_returnsPendingSpoolsToNew_onlyWhenTheReturnedStockCoversThem() {
        Batch batch = new Batch("BATCH-1");
        ReflectionTestUtils.setField(batch, "id", 5L);
        Spool batched = spool(1L, "SP-01");
        batched.setStatus(SpoolStatus.BATCHED);
        Spool resolved = spool(2L, "SP-02");
        resolved.setStatus(SpoolStatus.PENDING_MATERIAL);
        Spool stillShort = spool(3L, "SP-03");
        stillShort.setStatus(SpoolStatus.PENDING_MATERIAL);

        when(batchRepository.findById(5L)).thenReturn(Optional.of(batch));
        when(batchSpoolRepository.findByBatchIdOrderByIdAsc(5L)).thenReturn(List.of(new BatchSpool(batch, batched)));
        when(spoolMaterialRepository.findBySpoolIdIn(List.of(1L))).thenReturn(List.of(requirement(batched, pipe, 6)));
        when(spoolRepository.findByStatusInOrderByIdAsc(List.of(SpoolStatus.PENDING_MATERIAL)))
                .thenReturn(List.of(resolved, stillShort));
        //pipe goes from 10 to 16 once the batch is cancelled, the flange stays at 2
        when(spoolMaterialRepository.findBySpoolIdIn(List.of(2L, 3L)))
                .thenReturn(List.of(requirement(resolved, pipe, 12), requirement(stillShort, flange, 5)));

        batchService.delete(5L);

        assertThat(batched.getStatus()).isEqualTo(SpoolStatus.NEW);
        assertThat(resolved.getStatus()).isEqualTo(SpoolStatus.NEW);
        assertThat(stillShort.getStatus()).isEqualTo(SpoolStatus.PENDING_MATERIAL);
    }

    //ids are normally set by the database, the test sets them by hand
    private Spool spool(Long id, String spoolNo) {
        Spool spool = new Spool(spoolNo, iso);
        ReflectionTestUtils.setField(spool, "id", id);
        return spool;
    }

    private SpoolMaterial requirement(Spool spool, Material material, int qtyRequired) {
        return new SpoolMaterial(spool, material, qtyRequired);
    }

    private void givenCandidates(Spool... spools) {
        when(spoolRepository.findByStatusInOrderByIdAsc(anyCollection())).thenReturn(List.of(spools));
    }

    private void givenRequirements(SpoolMaterial... requirements) {
        when(spoolMaterialRepository.findBySpoolIdIn(anyCollection())).thenReturn(List.of(requirements));
    }

    private void givenBatchSaveReturnsBatch() {
        when(batchRepository.save(any(Batch.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }
}
