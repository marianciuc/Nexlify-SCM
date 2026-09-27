package com.marianciuc.nexifly.inventory.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.util.UUID;

@Builder
public record CreateCategoryRequest(
        @NotBlank(message = "Category name is required")
        @Size(max = 200, message = "Category name must not exceed 200 characters")
        String name,

        @Size(max = 200, message = "Slug must not exceed 200 characters")
        String slug,

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        String description,

        UUID parentId,

        Integer sortOrder
) {
}
