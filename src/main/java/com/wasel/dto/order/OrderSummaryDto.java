package com.wasel.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderSummaryDto {

    private Long id;
    private String orderNumber;
    private String storeName;
    private String status;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
}
