package org.example.ccc_fs_a.spool;

import java.util.Collection;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

//@EntityGraph loads each spool's iso in the same query, avoiding one extra query per spool (N+1)
public interface SpoolRepository extends JpaRepository<Spool, Long> {

    boolean existsByIsoIdAndSpoolNo(Long isoId, String spoolNo);

    boolean existsByIsoIdAndStatus(Long isoId, SpoolStatus status);

    long countByStatus(SpoolStatus status);

    @EntityGraph(attributePaths = "iso")
    Page<Spool> findByIsoId(Long isoId, Pageable pageable);

    @EntityGraph(attributePaths = "iso")
    Page<Spool> findBySpoolNoContainingIgnoreCase(String spoolNo, Pageable pageable);

    @EntityGraph(attributePaths = "iso")
    Page<Spool> findByStatusAndSpoolNoContainingIgnoreCase(SpoolStatus status, String spoolNo, Pageable pageable);

    @EntityGraph(attributePaths = "iso")
    List<Spool> findByStatusInOrderByIdAsc(Collection<SpoolStatus> statuses);
}
