package com.wasel.dto.product;

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
public class UpdateProductRequest {

    @Size(max = 150, message = "Product name must not exceed 150 characters")
    private String name;

    private String description;

    @PositiveOrZero(message = "Price cannot be negative")
    private BigDecimal price;

    private Long categoryId;

    private String imageUrl;
}
