package com.marianciuc.nexifly.logistic.domain.dto;

import lombok.Builder;

import java.time.LocalDate;
import java.util.UUID;

@Builder
public record DriverResponse(
        UUID id,
        UUID userId,
        UUID carrierId,
        String licenseNumber,
        String licenseCategory,
        String adrCertNumber,
        LocalDate adrCertExpires,
        boolean isAvailable
) {}
