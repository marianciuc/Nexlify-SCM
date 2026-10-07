package com.marianciuc.nexifly.inventory.domain.dto.response;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record ManufacturerResponse(
        UUID id,
        String code,
        String name,
        String country,
        String website,
        String contactEmail,
        boolean isActive,
        Instant createdAt,
        Instant updatedAt
) {
}
