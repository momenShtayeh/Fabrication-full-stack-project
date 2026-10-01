package org.example.ccc_fs_a.spool;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SpoolMaterialRequest(

        @NotNull
        Long materialId,

        @NotNull
        @Positive
        Integer qtyRequired
) {
}
