package org.example.ccc_fs_a.material;

import org.example.ccc_fs_a.common.exception.BusinessRuleException;
import org.example.ccc_fs_a.common.exception.DuplicateResourceException;
import org.example.ccc_fs_a.common.exception.ResourceNotFoundException;
import org.example.ccc_fs_a.spool.SpoolMaterialRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final SpoolMaterialRepository spoolMaterialRepository;

    public MaterialService(MaterialRepository materialRepository, SpoolMaterialRepository spoolMaterialRepository) {
        this.materialRepository = materialRepository;
        this.spoolMaterialRepository = spoolMaterialRepository;
    }

    public Page<MaterialResponse> getAll(String search, Pageable pageable) {
        return materialRepository.findByCodeContainingIgnoreCase(search.trim(), pageable)
                .map(MaterialResponse::from);
    }

    public MaterialResponse getById(Long id) {
        return MaterialResponse.from(findMaterial(id));
    }

    @Transactional
    public MaterialResponse create(MaterialRequest request) {
        ensureCodeIsUnique(request.code());

        Material material = new Material(request.code(), request.description(), request.quantity());
        return MaterialResponse.from(materialRepository.save(material));
    }

    @Transactional
    public MaterialResponse update(Long id, MaterialRequest request) {
        Material material = findMaterial(id);
        if (!material.getCode().equals(request.code())) {
            ensureCodeIsUnique(request.code());
        }

        material.setCode(request.code());
        material.setDescription(request.description());
        material.setQuantity(request.quantity());
        return MaterialResponse.from(material);
    }

    //adds to the stock instead of replacing it, so a batch generated at the same time is not overwritten
    @Transactional
    public MaterialResponse receiveStock(Long id, StockReceiptRequest request) {
        Material material = findMaterial(id);
        material.addStock(request.quantity());
        return MaterialResponse.from(material);
    }

    @Transactional
    public void delete(Long id) {
        Material material = findMaterial(id);
        if (spoolMaterialRepository.existsByMaterialId(id)) {
            throw new BusinessRuleException("Material '" + material.getCode() + "' is required by spools and cannot be deleted");
        }
        materialRepository.delete(material);
    }

    private Material findMaterial(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material with id " + id + " not found"));
    }

    private void ensureCodeIsUnique(String code) {
        if (materialRepository.existsByCode(code)) {
            throw new DuplicateResourceException("Material with code '" + code + "' already exists");
        }
    }
}
