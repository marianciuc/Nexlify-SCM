package com.marianciuc.nexifly.inventory.domain.dto.response;

import com.marianciuc.nexifly.inventory.domain.enums.Units;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Builder
public record ProductResponse(
        UUID id,
        String sku,
        String name,
        String description,
        UUID categoryId,
        String categoryName,
        Units unit,
        BigDecimal unitPrice,
        String currency,
        BigDecimal weightKg,
        String dimensions,
        String manufacturer,
        String brand,
        UUID brandId,
        UUID manufacturerId,
        Integer minOrderQuantity,
        Integer reorderPoint,
        boolean isActive,
        int totalAvailable,
        int totalReserved,
        Instant createdAt,
        Instant updatedAt
) {
}
