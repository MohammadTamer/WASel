package com.wasel.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDto {

    private long totalCustomers;
    private long totalStores;
    private long totalDrivers;
    private long activeOrders;
    private long completedOrders;
    private long cancelledOrders;
    private long totalOrders;
}
