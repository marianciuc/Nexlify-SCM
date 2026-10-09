package com.marianciuc.nexifly.inventory.mapper;

import com.marianciuc.nexifly.inventory.domain.dto.request.CreateWarehouseRequest;
import com.marianciuc.nexifly.inventory.domain.dto.response.WarehouseResponse;
import com.marianciuc.nexifly.inventory.repository.entity.WarehouseEn;
import org.mapstruct.*;

@Mapper(
        componentModel = MappingConstants.ComponentModel.SPRING,
        builder = @Builder(disableBuilder = true)
)
public interface WarehouseMapper {

    @Mapping(target = "isActive", source = "active")
    WarehouseResponse toWarehouseResponse(WarehouseEn entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "utilizedCapacityPallets", constant = "0")
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "stockItems", ignore = true)
    @Mapping(target = "storageZones", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    WarehouseEn toEntity(CreateWarehouseRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "utilizedCapacityPallets", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "stockItems", ignore = true)
    @Mapping(target = "storageZones", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(CreateWarehouseRequest request, @MappingTarget WarehouseEn entity);
}
