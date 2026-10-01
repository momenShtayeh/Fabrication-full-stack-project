package org.example.ccc_fs_a.iso;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record IsoRequest(

        @NotBlank
        @Size(max = 50)
        String isoNo,

        @NotBlank
        @Size(max = 10)
        String revision,

        @NotNull
        IsoStatus status
) {
}
