package org.example.ccc_fs_a.material;

public record MaterialResponse(Long id, String code, String description, Integer quantity) {

    public static MaterialResponse from(Material material) {
        return new MaterialResponse(
                material.getId(),
                material.getCode(),
                material.getDescription(),
                material.getQuantity()
        );
    }
}
