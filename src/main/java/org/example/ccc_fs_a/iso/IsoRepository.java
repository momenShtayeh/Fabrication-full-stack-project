package org.example.ccc_fs_a.iso;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IsoRepository extends JpaRepository<Iso, Long> {

    boolean existsByIsoNo(String isoNo);

    Page<Iso> findByIsoNoContainingIgnoreCase(String isoNo, Pageable pageable);
}
