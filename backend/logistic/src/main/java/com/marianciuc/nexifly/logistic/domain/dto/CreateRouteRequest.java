package com.marianciuc.nexifly.logistic.domain.dto;

import lombok.Builder;

import java.util.List;
import java.util.UUID;

@Builder
public record CreateRouteRequest(
        UUID vehicleId,
        UUID driverId,
        String notes,
        List<DeliveryStopRequest> stops
) {}
