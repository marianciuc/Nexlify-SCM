package com.marianciuc.nexifly.orders.domain.enums;

public enum OrderStatus {
    DRAFT,
    SUBMITTED,
    RESERVED,
    CANCELLED_OUT_OF_STOCK,
    AWAITING_PAYMENT,
    PAID,
    PAYMENT_FAILED,
    IN_PROCESSING,
    SHIPPED,
    DELIVERED,
    COMPLETED,
    CANCELLED,
    DISPUTED
}
