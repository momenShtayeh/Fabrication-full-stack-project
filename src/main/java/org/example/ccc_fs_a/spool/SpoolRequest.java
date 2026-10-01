package org.example.ccc_fs_a.spool;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SpoolRequest(

        @NotBlank
        @Size(max = 50)
        String spoolNo
) {
}
