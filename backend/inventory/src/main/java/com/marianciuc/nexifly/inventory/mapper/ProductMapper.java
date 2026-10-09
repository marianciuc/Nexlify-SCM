package com.marianciuc.nexifly.inventory.mapper;

import com.marianciuc.nexifly.inventory.domain.dto.request.CreateProductRequest;
import com.marianciuc.nexifly.inventory.domain.dto.response.ProductResponse;
import com.marianciuc.nexifly.inventory.repository.entity.ProductEn;
import org.mapstruct.*;

@Mapper(
        componentModel = MappingConstants.ComponentModel.SPRING,
        builder = @Builder(disableBuilder = true)
)
public interface ProductMapper {

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "currency", source = "currencyCode")
    @Mapping(target = "brand", source = "brandName")
    @Mapping(target = "brandId", source = "brand.id")
    @Mapping(target = "manufacturer", source = "manufacturerName")
    @Mapping(target = "manufacturerId", source = "manufacturer.id")
    @Mapping(target = "dimensions", expression = "java(entity.getDimensions() != null ? (entity.getDimensions().getHeight() + \"x\" + entity.getDimensions().getWidth() + \"x\" + entity.getDimensions().getDepth() + \" \" + entity.getDimensions().getDimensionUnit()) : null)")
    @Mapping(target = "isActive", source = "active")
    @Mapping(target = "totalAvailable", expression = "java(entity.getTotalAvailable())")
    @Mapping(target = "totalReserved", expression = "java(entity.getTotalReserved())")
    ProductResponse toProductResponse(ProductEn entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "manufacturer", ignore = true)
    @Mapping(target = "dimensions", ignore = true)
    @Mapping(target = "currencyCode", source = "currency", defaultValue = "PLN")
    @Mapping(target = "unit", source = "unit", defaultExpression = "java(com.marianciuc.nexifly.inventory.domain.enums.Units.PCS)")
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "stockItems", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ProductEn toEntity(CreateProductRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "manufacturer", ignore = true)
    @Mapping(target = "dimensions", ignore = true)
    @Mapping(target = "currencyCode", source = "currency")
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "stockItems", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(CreateProductRequest request, @MappingTarget ProductEn entity);
}
