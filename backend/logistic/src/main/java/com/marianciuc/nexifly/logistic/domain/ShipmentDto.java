package com.marianciuc.nexifly.logistic.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentDto {
    private UUID id;
    private String trackingNumber;
    private UUID orderId;
    private String orderNumber;
    private String carrier;
    private String originCity;
    private String destinationCity;
    private String status; // PLANNED, DISPATCHED, IN_TRANSIT, DELIVERED
    private double distanceKm;
    private double durationHours;
    private BigDecimal shippingCost;
    private Instant dispatchedAt;
    private Instant estimatedDelivery;
    private String vehicleRegistration;
}
