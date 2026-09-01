package com.wasel.dto.delivery;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryDto {

    private Long id;
    private Long orderId;
    private String orderNumber;
    private Long driverId;
    private String driverName;
    private String status;
    private String storeName;
    private String storeAddress;
    private String customerAddress;
    private LocalDateTime assignedAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime deliveredAt;
    private String failureReason;
    private LocalDateTime createdAt;
}
