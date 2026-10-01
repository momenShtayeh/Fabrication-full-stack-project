package org.example.ccc_fs_a.batch;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

//one material a spool was short of, with the quantities at the moment the batch was generated
@Embeddable
public record MaterialShortage(

        @Column(name = "material_code", nullable = false, length = 50)
        String materialCode,

        @Column(name = "qty_required", nullable = false)
        Integer required,

        @Column(name = "qty_available", nullable = false)
        Integer available
) {
}
