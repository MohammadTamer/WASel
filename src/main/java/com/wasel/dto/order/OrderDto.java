package com.wasel.dto.order;

import com.wasel.dto.address.AddressDto;
import com.wasel.dto.delivery.DeliveryDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {

    private Long id;
    private String orderNumber;
    private Long customerId;
    private String customerName;
    private Long storeId;
    private String storeName;
    private AddressDto address;
    private String status;
    private BigDecimal subtotal;
    private BigDecimal deliveryFee;
    private BigDecimal totalAmount;
    private String cancellationReason;
    private List<OrderItemDto> items;
    private DeliveryDto delivery;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
