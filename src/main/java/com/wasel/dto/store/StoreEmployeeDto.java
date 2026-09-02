package com.wasel.dto.store;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreEmployeeDto {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private Long storeId;
    private String storeName;
    private LocalDateTime assignedAt;
}
