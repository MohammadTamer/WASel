package com.wasel.dto.review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {

    private Long id;
    private Long orderId;
    private String orderNumber;
    private Long customerId;
    private String customerName;
    private Integer storeRating;
    private Integer driverRating;
    private String comment;
    private LocalDateTime createdAt;
}
