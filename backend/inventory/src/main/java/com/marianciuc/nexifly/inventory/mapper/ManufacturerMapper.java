package com.marianciuc.nexifly.inventory.mapper;

import com.marianciuc.nexifly.inventory.domain.dto.response.ManufacturerResponse;
import com.marianciuc.nexifly.inventory.repository.entity.ManufacturerEn;
import org.mapstruct.*;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ManufacturerMapper {

    @Mapping(target = "isActive", source = "active")
    ManufacturerResponse toManufacturerResponse(ManufacturerEn entity);
}
