package com.marianciuc.nexifly.inventory.mapper;

import com.marianciuc.nexifly.inventory.domain.dto.response.CategoryResponse;
import com.marianciuc.nexifly.inventory.domain.dto.response.ProductResponse;
import com.marianciuc.nexifly.inventory.domain.dto.response.StockItemResponse;
import com.marianciuc.nexifly.inventory.domain.dto.response.WarehouseResponse;
import com.marianciuc.nexifly.inventory.repository.entity.CategoryEn;
import com.marianciuc.nexifly.inventory.repository.entity.ProductEn;
import com.marianciuc.nexifly.inventory.repository.entity.StockItemEn;
import com.marianciuc.nexifly.inventory.repository.entity.WarehouseEn;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(
        componentModel = MappingConstants.ComponentModel.SPRING
)
public interface CategorytMapper {

    @Mapping(target = "productCount", source = "products")
    @Mapping(target = "parentName", source = "parent.name")
    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "isActive", source = "active")
    CategoryResponse toCategoryResponse(CategoryEn entity);

    @Mapping(target = "categoryName", source = "name")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "isActive", source = "active")
    ProductResponse toProductResponse(ProductEn entity);

    @Mapping(target = "isActive", source = "active")
    WarehouseResponse toWarehouseResponse(WarehouseEn entity);

    @Mapping(target = "warehouseName", source = "warehouse.name")
    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "unitPrice", source = "product.unitPrice")
    @Mapping(target = "unit", source = "product.unit")
    @Mapping(target = "sku", source = "product.sku")
    @Mapping(target = "name", source = "product.name")
    @Mapping(target = "category", source = "product.category")
    StockItemResponse toStockItemResponse(StockItemEn entity);
}
