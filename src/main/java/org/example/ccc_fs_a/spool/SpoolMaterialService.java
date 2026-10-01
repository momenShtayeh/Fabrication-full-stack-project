package org.example.ccc_fs_a.spool;

import java.util.List;

import org.example.ccc_fs_a.common.exception.DuplicateResourceException;
import org.example.ccc_fs_a.common.exception.ResourceNotFoundException;
import org.example.ccc_fs_a.material.Material;
import org.example.ccc_fs_a.material.MaterialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SpoolMaterialService {

    private final SpoolMaterialRepository spoolMaterialRepository;
    private final MaterialRepository materialRepository;
    private final SpoolService spoolService;

    public SpoolMaterialService(SpoolMaterialRepository spoolMaterialRepository,
                                MaterialRepository materialRepository,
                                SpoolService spoolService) {
        this.spoolMaterialRepository = spoolMaterialRepository;
        this.materialRepository = materialRepository;
        this.spoolService = spoolService;
    }

    public List<SpoolMaterialResponse> getBySpool(Long spoolId) {
        spoolService.findSpool(spoolId);
        return spoolMaterialRepository.findBySpoolIdOrderByIdAsc(spoolId).stream()
                .map(SpoolMaterialResponse::from)
                .toList();
    }

    @Transactional
    public SpoolMaterialResponse add(Long spoolId, SpoolMaterialRequest request) {
        Spool spool = spoolService.findSpool(spoolId);
        spoolService.ensureNotBatched(spool);

        Material material = materialRepository.findById(request.materialId())
                .orElseThrow(() -> new ResourceNotFoundException("Material with id " + request.materialId() + " not found"));
        if (spoolMaterialRepository.existsBySpoolIdAndMaterialId(spoolId, material.getId())) {
            throw new DuplicateResourceException("Material '" + material.getCode() + "' is already required by this spool");
        }

        SpoolMaterial spoolMaterial = new SpoolMaterial(spool, material, request.qtyRequired());
        return SpoolMaterialResponse.from(spoolMaterialRepository.save(spoolMaterial));
    }

    @Transactional
    public SpoolMaterialResponse updateQuantity(Long spoolId, Long id, SpoolMaterialUpdateRequest request) {
        SpoolMaterial spoolMaterial = findSpoolMaterial(spoolId, id);
        spoolService.ensureNotBatched(spoolMaterial.getSpool());

        spoolMaterial.setQtyRequired(request.qtyRequired());
        return SpoolMaterialResponse.from(spoolMaterial);
    }

    @Transactional
    public void remove(Long spoolId, Long id) {
        SpoolMaterial spoolMaterial = findSpoolMaterial(spoolId, id);
        spoolService.ensureNotBatched(spoolMaterial.getSpool());

        spoolMaterialRepository.delete(spoolMaterial);
    }

    //looking up by both ids stops a requirement being changed through another spool's url
    private SpoolMaterial findSpoolMaterial(Long spoolId, Long id) {
        return spoolMaterialRepository.findByIdAndSpoolId(id, spoolId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Material requirement with id " + id + " not found in spool " + spoolId));
    }
}
