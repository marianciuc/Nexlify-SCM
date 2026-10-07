package com.marianciuc.nexifly.inventory.domain.dto.response;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record BrandResponse(
        UUID id,
        String code,
        String name,
        String description,
        String website,
        boolean isActive,
        Instant createdAt,
        Instant updatedAt
) {
}
