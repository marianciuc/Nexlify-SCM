package com.marianciuc.nexifly.inventory.domain.dto.response;

import lombok.Builder;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Builder
public record CategoryResponse(
        UUID id,
        String name,
        String slug,
        String description,
        UUID parentId,
        String parentName,
        Integer sortOrder,
        boolean isActive,
        int productCount,
        List<CategoryResponse> children,
        Instant createdAt,
        Instant updatedAt
) {
}
