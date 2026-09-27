package com.marianciuc.nexifly.logistic.domain.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record DeliveryStopRequest(
        UUID orderId,
        Integer stopSequence,
        String address,
        String city,
        BigDecimal latitude,
        BigDecimal longitude
) {}
