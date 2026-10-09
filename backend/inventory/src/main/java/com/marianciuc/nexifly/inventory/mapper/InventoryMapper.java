package com.marianciuc.nexifly.inventory.mapper;

import com.marianciuc.nexifly.inventory.domain.dto.request.CreateCategoryRequest;
import com.marianciuc.nexifly.inventory.domain.dto.request.CreateProductRequest;
import com.marianciuc.nexifly.inventory.domain.dto.request.CreateWarehouseRequest;
import com.marianciuc.nexifly.inventory.domain.dto.response.CategoryResponse;
import com.marianciuc.nexifly.inventory.domain.dto.response.ProductResponse;
import com.marianciuc.nexifly.inventory.domain.dto.response.StockItemResponse;
import com.marianciuc.nexifly.inventory.domain.dto.response.WarehouseResponse;
import com.marianciuc.nexifly.inventory.domain.enums.Units;
import com.marianciuc.nexifly.inventory.repository.entity.CategoryEn;
import com.marianciuc.nexifly.inventory.repository.entity.ProductEn;
import com.marianciuc.nexifly.inventory.repository.entity.StockItemEn;
import com.marianciuc.nexifly.inventory.repository.entity.WarehouseEn;
import org.mapstruct.*;

@Mapper(
        componentModel = MappingConstants.ComponentModel.SPRING,
        builder = @Builder(disableBuilder = true)
)
public interface InventoryMapper {

    @Mapping(target = "productCount", expression = "java(entity.getProducts() != null ? entity.getProducts().size() : 0)")
    @Mapping(target = "parentName", source = "parent.name")
    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "isActive", source = "active")
    CategoryResponse toCategoryResponse(CategoryEn entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "children", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    CategoryEn toCategoryEntity(CreateCategoryRequest request);

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
    ProductEn toProductEntity(CreateProductRequest request);

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
    void updateProductEntityFromRequest(CreateProductRequest request, @MappingTarget ProductEn entity);

    @Mapping(target = "isActive", source = "active")
    WarehouseResponse toWarehouseResponse(WarehouseEn entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "utilizedCapacityPallets", constant = "0")
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "stockItems", ignore = true)
    @Mapping(target = "storageZones", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    WarehouseEn toWarehouseEntity(CreateWarehouseRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "utilizedCapacityPallets", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "stockItems", ignore = true)
    @Mapping(target = "storageZones", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateWarehouseEntityFromRequest(CreateWarehouseRequest request, @MappingTarget WarehouseEn entity);

    @Mapping(target = "warehouseName", source = "warehouse.name")
    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "unitPrice", source = "product.unitPrice")
    @Mapping(target = "unit", expression = "java(entity.getProduct() != null && entity.getProduct().getUnit() != null ? entity.getProduct().getUnit().getCode() : null)")
    @Mapping(target = "sku", source = "product.sku")
    @Mapping(target = "name", source = "product.name")
    @Mapping(target = "category", source = "product.category.name")
    @Mapping(target = "status", expression = "java(entity.getStatus() != null ? entity.getStatus().name() : null)")
    StockItemResponse toStockItemResponse(StockItemEn entity);

    default String mapUnitsToString(Units unit) {
        return unit != null ? unit.getCode() : null;
    }
}
