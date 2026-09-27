package com.marianciuc.nexifly.logistic.domain.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Builder
public record DeliveryStopResponse(
        UUID id,
        UUID orderId,
        Integer stopSequence,
        String address,
        String city,
        BigDecimal latitude,
        BigDecimal longitude,
        Instant plannedArrival,
        Instant actualArrival,
        Instant plannedDeparture,
        Instant actualDeparture,
        String status,
        String signatureName,
        String proofOfDeliveryUrl
) {}
