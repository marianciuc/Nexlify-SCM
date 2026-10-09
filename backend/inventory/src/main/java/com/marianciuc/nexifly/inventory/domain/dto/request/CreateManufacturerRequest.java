package com.marianciuc.nexifly.inventory.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record CreateManufacturerRequest(
        @NotBlank(message = "Manufacturer name is required")
        @Size(max = 200, message = "Manufacturer name must not exceed 200 characters")
        String name,

        @Size(max = 100, message = "Manufacturer code must not exceed 100 characters")
        String code,

        @Size(max = 100, message = "Country must not exceed 100 characters")
        String country,

        @Size(max = 255, message = "Website must not exceed 255 characters")
        String website,

        @Size(max = 255, message = "Contact email must not exceed 255 characters")
        String contactEmail
) {
}
