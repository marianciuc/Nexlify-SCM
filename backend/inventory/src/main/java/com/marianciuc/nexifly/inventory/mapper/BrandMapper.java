package com.marianciuc.nexifly.inventory.mapper;

import com.marianciuc.nexifly.inventory.domain.dto.response.BrandResponse;
import com.marianciuc.nexifly.inventory.repository.entity.BrandEn;
import org.mapstruct.*;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface BrandMapper {

    @Mapping(target = "isActive", source = "active")
    BrandResponse toBrandResponse(BrandEn entity);
}
