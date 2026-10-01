package org.example.ccc_fs_a.batch;

import java.time.LocalDateTime;
import java.util.List;

import org.example.ccc_fs_a.spool.Spool;
import org.example.ccc_fs_a.spool.SpoolResponse;

//a batch with its report: the spools it contains, the materials they took, and the spools left out and why
public record BatchDetailResponse(
        Long id,
        String batchNo,
        LocalDateTime createdDate,
        List<SpoolResponse> spools,
        List<MaterialUsageResponse> materialsUsed,
        List<SkippedSpoolResponse> skippedSpools
) {

    public static BatchDetailResponse from(Batch batch,
                                           List<Spool> spools,
                                           List<MaterialUsageResponse> materialsUsed,
                                           List<SkippedSpoolResponse> skippedSpools) {
        return new BatchDetailResponse(
                batch.getId(),
                batch.getBatchNo(),
                batch.getCreatedDate(),
                spools.stream().map(SpoolResponse::from).toList(),
                materialsUsed,
                skippedSpools
        );
    }
}
