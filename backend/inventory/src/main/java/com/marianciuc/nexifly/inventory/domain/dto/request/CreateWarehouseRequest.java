package com.marianciuc.nexifly.inventory.domain.dto.request;

import jakarta.validation.constraints.*;
import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record CreateWarehouseRequest(
        @NotBlank(message = "Warehouse code is required")
        @Size(max = 30, message = "Code must not exceed 30 characters")
        String code,

        @NotBlank(message = "Warehouse name is required")
        @Size(max = 200, message = "Name must not exceed 200 characters")
        String name,

        @NotBlank(message = "City is required")
        @Size(max = 100, message = "City must not exceed 100 characters")
        String city,

        @Size(max = 300, message = "Address must not exceed 300 characters")
        String address,

        BigDecimal latitude,
        BigDecimal longitude,

        @Min(value = 0, message = "Total capacity must be non-negative")
        Integer totalCapacityPallets,

        BigDecimal temperatureZoneMin,
        BigDecimal temperatureZoneMax
) {
}
