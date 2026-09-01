package com.wasel.dto.address;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressDto {

    private Long id;
    private String label;
    private String addressLine;
    private String city;
    private String buildingNumber;
    private String floor;
    private String apartment;
    private String notes;
    private LocalDateTime createdAt;
}
