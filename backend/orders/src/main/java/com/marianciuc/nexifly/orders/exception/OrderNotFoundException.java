package com.marianciuc.nexifly.orders.exception;

import java.util.UUID;

public class OrderNotFoundException extends RuntimeException {
    public OrderNotFoundException(UUID orderId) {
        super("Order not found with ID: " + orderId);
    }

    public OrderNotFoundException(String message) {
        super(message);
    }
}
