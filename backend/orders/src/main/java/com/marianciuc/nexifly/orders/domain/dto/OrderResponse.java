package com.marianciuc.nexifly.orders.domain.dto;

import com.marianciuc.nexifly.orders.domain.enums.OrderStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Builder
public record OrderResponse(
        UUID id,
        String orderNumber,
        UUID tenantId,
        UUID customerId,
        UUID supplierId,
        OrderStatus status,
        String currency,
        BigDecimal subtotal,
        BigDecimal vatAmount,
        BigDecimal totalAmount,
        String deliveryAddress,
        String deliveryCity,
        String deliveryPostalCode,
        LocalDate requestedDeliveryDate,
        Instant slaDeadline,
        String notes,
        List<OrderItemResponse> items,
        List<StatusHistoryResponse> statusHistory,
        Instant createdAt,
        Instant updatedAt
) {
    @Builder
    public record OrderItemResponse(
            UUID id,
            UUID productId,
            String sku,
            String productName,
            int quantity,
            BigDecimal unitPrice,
            BigDecimal discountPercent,
            BigDecimal vatRate,
            BigDecimal lineTotal,
            UUID warehouseId,
            String batchNumber
    ) {}

    @Builder
    public record StatusHistoryResponse(
            UUID id,
            String oldStatus,
            String newStatus,
            UUID changedBy,
            String reason,
            Instant createdAt
    ) {}
}
