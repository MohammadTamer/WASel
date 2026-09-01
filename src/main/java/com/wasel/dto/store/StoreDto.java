package com.wasel.dto.store;

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
public class StoreDto {

    private Long id;
    private Long ownerId;
    private String ownerName;
    private String name;
    private String description;
    private String phone;
    private String address;
    private String status;
    private BigDecimal rating;
    private BigDecimal deliveryFee;
    private LocalDateTime createdAt;
}
