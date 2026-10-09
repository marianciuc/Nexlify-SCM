package com.marianciuc.nexifly.inventory.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record CreateBrandRequest(
        @NotBlank(message = "Brand name is required")
        @Size(max = 200, message = "Brand name must not exceed 200 characters")
        String name,

        @Size(max = 100, message = "Brand code must not exceed 100 characters")
        String code,

        @Size(max = 5000, message = "Description must not exceed 5000 characters")
        String description,

        @Size(max = 255, message = "Website must not exceed 255 characters")
        String website
) {
}
