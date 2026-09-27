package com.marianciuc.nexifly.inventory.domain.dto.response;

import com.marianciuc.nexifly.inventory.domain.enums.StockStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Response DTO for stock items. Designed to be backward-compatible with the
 * original StockItemDto shape that the frontend expects.
 */
@Builder
public record StockItemResponse(
        UUID id,
        String sku,
        String name,
        String category,
        UUID warehouseId,
        String warehouseName,
        int quantityAvailable,
        int quantityReserved,
        String unit,
        BigDecimal unitPrice,
        String status,
        String batchNumber,
        String lotNumber,
        LocalDate expiryDate,
        Instant lastCountedAt
) {
}
