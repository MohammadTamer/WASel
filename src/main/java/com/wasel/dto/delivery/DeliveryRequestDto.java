package com.wasel.dto.delivery;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryRequestDto {

    private Long deliveryId;
    private Long orderId;
    private String orderNumber;
    private String storeName;
    private String storeAddress;
    private String customerArea;
    private BigDecimal deliveryFee;
    private int itemCount;
}
