package org.example.ccc_fs_a.batch;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BatchSpoolRepository extends JpaRepository<BatchSpool, Long> {

    @EntityGraph(attributePaths = {"spool", "spool.iso"})
    List<BatchSpool> findByBatchIdOrderByIdAsc(Long batchId);
}
