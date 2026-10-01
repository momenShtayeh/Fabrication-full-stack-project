package org.example.ccc_fs_a.spool;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpoolMaterialRepository extends JpaRepository<SpoolMaterial, Long> {

    boolean existsBySpoolIdAndMaterialId(Long spoolId, Long materialId);

    boolean existsByMaterialId(Long materialId);

    Optional<SpoolMaterial> findByIdAndSpoolId(Long id, Long spoolId);

    @EntityGraph(attributePaths = "material")
    List<SpoolMaterial> findBySpoolIdOrderByIdAsc(Long spoolId);

    @EntityGraph(attributePaths = "material")
    List<SpoolMaterial> findBySpoolIdIn(Collection<Long> spoolIds);
}
