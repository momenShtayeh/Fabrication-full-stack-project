package org.example.ccc_fs_a.material;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialRepository extends JpaRepository<Material, Long> {

    boolean existsByCode(String code);

    Page<Material> findByCodeContainingIgnoreCase(String code, Pageable pageable);

    long countByQuantityGreaterThan(int quantity);
}
