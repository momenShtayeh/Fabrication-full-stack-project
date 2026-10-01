package org.example.ccc_fs_a.spool;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

//only the quantity can change, to use a different material remove the requirement and add a new one
public record SpoolMaterialUpdateRequest(

        @NotNull
        @Positive
        Integer qtyRequired
) {
}
