package org.example.ccc_fs_a.spool;

public record SpoolMaterialResponse(
        Long id,
        Long materialId,
        String materialCode,
        String materialDescription,
        Integer qtyRequired,
        Integer availableQuantity
) {

    public static SpoolMaterialResponse from(SpoolMaterial spoolMaterial) {
        return new SpoolMaterialResponse(
                spoolMaterial.getId(),
                spoolMaterial.getMaterial().getId(),
                spoolMaterial.getMaterial().getCode(),
                spoolMaterial.getMaterial().getDescription(),
                spoolMaterial.getQtyRequired(),
                spoolMaterial.getMaterial().getQuantity()
        );
    }
}
