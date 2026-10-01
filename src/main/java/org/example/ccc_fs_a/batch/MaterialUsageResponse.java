package org.example.ccc_fs_a.batch;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.example.ccc_fs_a.material.Material;
import org.example.ccc_fs_a.spool.SpoolMaterial;

//how much of one material a batch took from stock
public record MaterialUsageResponse(String materialCode, String description, int quantity) {

    //adds up the requirements of the batched spools per material
    public static List<MaterialUsageResponse> sumOf(List<SpoolMaterial> requirements) {
        Map<Material, Integer> totals = requirements.stream()
                .collect(Collectors.groupingBy(SpoolMaterial::getMaterial,
                        Collectors.summingInt(SpoolMaterial::getQtyRequired)));
        return totals.entrySet().stream()
                .map(total -> new MaterialUsageResponse(
                        total.getKey().getCode(), total.getKey().getDescription(), total.getValue()))
                .sorted(Comparator.comparing(MaterialUsageResponse::materialCode))
                .toList();
    }
}
