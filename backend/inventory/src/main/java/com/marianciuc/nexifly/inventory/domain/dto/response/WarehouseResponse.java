package com.marianciuc.nexifly.inventory.domain.dto.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Builder
public record WarehouseResponse(
        UUID id,
        String code,
        String name,
        String city,
        String address,
        BigDecimal latitude,
        BigDecimal longitude,
        Integer totalCapacityPallets,
        Integer utilizedCapacityPallets,
        double utilizationPercent,
        BigDecimal temperatureZoneMin,
        BigDecimal temperatureZoneMax,
        boolean isActive,
        Instant createdAt,
        Instant updatedAt
) {
}
