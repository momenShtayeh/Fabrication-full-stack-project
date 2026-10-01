package org.example.ccc_fs_a.material;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

//the quantity that arrived at the warehouse, added on top of the current stock
public record StockReceiptRequest(

        @NotNull
        @Positive
        Integer quantity
) {
}
