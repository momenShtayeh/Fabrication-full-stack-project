package org.example.ccc_fs_a.batch;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BatchSkippedSpoolRepository extends JpaRepository<BatchSkippedSpool, Long> {

    @EntityGraph(attributePaths = "shortages")
    List<BatchSkippedSpool> findByBatchIdOrderByIdAsc(Long batchId);
}
