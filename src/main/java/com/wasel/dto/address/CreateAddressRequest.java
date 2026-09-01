package com.wasel.dto.address;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAddressRequest {

    @NotBlank(message = "Label is required")
    @Size(max = 50, message = "Label must not exceed 50 characters")
    private String label;

    @NotBlank(message = "Address line is required")
    private String addressLine;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @Size(max = 50, message = "Building number must not exceed 50 characters")
    private String buildingNumber;

    @Size(max = 20, message = "Floor must not exceed 20 characters")
    private String floor;

    @Size(max = 20, message = "Apartment must not exceed 20 characters")
    private String apartment;

    private String notes;
}
