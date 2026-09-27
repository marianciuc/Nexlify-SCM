package com.marianciuc.nexifly.inventory.domain.dto.request;

import jakarta.validation.constraints.*;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record CreateProductRequest(
        @NotBlank(message = "SKU is required")
        @Size(max = 50, message = "SKU must not exceed 50 characters")
        String sku,

        @NotBlank(message = "Product name is required")
        @Size(max = 300, message = "Product name must not exceed 300 characters")
        String name,

        @Size(max = 5000, message = "Description must not exceed 5000 characters")
        String description,

        UUID categoryId,

        @Size(max = 30, message = "Unit must not exceed 30 characters")
        String unit,

        @NotNull(message = "Unit price is required")
        @DecimalMin(value = "0.00", message = "Unit price must be non-negative")
        BigDecimal unitPrice,

        @Size(max = 3, message = "Currency code must be 3 characters")
        String currency,

        @DecimalMin(value = "0.0", message = "Weight must be non-negative")
        BigDecimal weightKg,

        @Size(max = 100, message = "Dimensions must not exceed 100 characters")
        String dimensions,

        @Size(max = 200, message = "Manufacturer must not exceed 200 characters")
        String manufacturer,

        @Size(max = 200, message = "Brand must not exceed 200 characters")
        String brand,

        @Min(value = 1, message = "Minimum order quantity must be at least 1")
        Integer minOrderQuantity,

        @Min(value = 0, message = "Reorder point must be non-negative")
        Integer reorderPoint
) {
}
