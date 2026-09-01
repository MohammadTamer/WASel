package com.wasel.dto.store;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStoreRequest {

    @Size(max = 150, message = "Store name must not exceed 150 characters")
    private String name;

    private String description;

    @Size(max = 30, message = "Phone must not exceed 30 characters")
    private String phone;

    private String address;

    @PositiveOrZero(message = "Delivery fee cannot be negative")
    private BigDecimal deliveryFee;
}
