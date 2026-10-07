package com.marianciuc.nexifly.inventory.domain.dto.response;

import com.marianciuc.nexifly.inventory.domain.enums.DimensionUnit;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record ProductDimensionsDto(
        UUID id,
        BigDecimal height,
        BigDecimal width,
        BigDecimal depth,
        DimensionUnit dimensionUnit,
        BigDecimal volumeM3
) {
}
