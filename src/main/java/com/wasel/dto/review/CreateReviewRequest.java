package com.wasel.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateReviewRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @Min(value = 1, message = "Store rating must be between 1 and 5")
    @Max(value = 5, message = "Store rating must be between 1 and 5")
    private Integer storeRating;

    @Min(value = 1, message = "Driver rating must be between 1 and 5")
    @Max(value = 5, message = "Driver rating must be between 1 and 5")
    private Integer driverRating;

    private String comment;
}
