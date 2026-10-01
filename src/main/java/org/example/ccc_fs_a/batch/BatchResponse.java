package org.example.ccc_fs_a.batch;

import java.time.LocalDateTime;

public record BatchResponse(Long id, String batchNo, LocalDateTime createdDate) {

    public static BatchResponse from(Batch batch) {
        return new BatchResponse(batch.getId(), batch.getBatchNo(), batch.getCreatedDate());
    }
}
