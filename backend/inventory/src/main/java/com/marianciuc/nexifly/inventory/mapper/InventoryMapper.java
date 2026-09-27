package com.marianciuc.nexifly.inventory.mapper;

import com.marianciuc.nexifly.inventory.domain.dto.response.CategoryResponse;
import com.marianciuc.nexifly.inventory.domain.dto.response.ProductResponse;
import com.marianciuc.nexifly.inventory.domain.dto.response.StockItemResponse;
import com.marianciuc.nexifly.inventory.domain.dto.response.WarehouseResponse;
import com.marianciuc.nexifly.inventory.repository.entity.CategoryEn;
import com.marianciuc.nexifly.inventory.repository.entity.ProductEn;
import com.marianciuc.nexifly.inventory.repository.entity.StockItemEn;
import com.marianciuc.nexifly.inventory.repository.entity.WarehouseEn;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class InventoryMapper {

    public CategoryResponse toCategoryResponse(CategoryEn entity) {
        if (entity == null) return null;
        return CategoryResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .slug(entity.getSlug())
                .description(entity.getDescription())
                .parentId(entity.getParent() != null ? entity.getParent().getId() : null)
                .parentName(entity.getParent() != null ? entity.getParent().getName() : null)
                .sortOrder(entity.getSortOrder())
                .isActive(entity.isActive())
                .productCount(entity.getProducts() != null ? entity.getProducts().size() : 0)
                .children(entity.getChildren() != null
                        ? entity.getChildren().stream().map(this::toCategoryResponse).toList()
                        : List.of())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public ProductResponse toProductResponse(ProductEn entity) {
        if (entity == null) return null;
        return ProductResponse.builder()
                .id(entity.getId())
                .sku(entity.getSku())
                .name(entity.getName())
                .description(entity.getDescription())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : null)
                .unit(entity.getUnit())
                .unitPrice(entity.getUnitPrice())
                .currency(entity.getCurrency())
                .weightKg(entity.getWeightKg())
                .dimensions(entity.getDimensions())
                .manufacturer(entity.getManufacturer())
                .brand(entity.getBrand())
                .minOrderQuantity(entity.getMinOrderQuantity())
                .reorderPoint(entity.getReorderPoint())
                .isActive(entity.isActive())
                .totalAvailable(entity.getTotalAvailable())
                .totalReserved(entity.getTotalReserved())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public WarehouseResponse toWarehouseResponse(WarehouseEn entity) {
        if (entity == null) return null;
        return WarehouseResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .city(entity.getCity())
                .address(entity.getAddress())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .totalCapacityPallets(entity.getTotalCapacityPallets())
                .utilizedCapacityPallets(entity.getUtilizedCapacityPallets())
                .utilizationPercent(entity.getUtilizationPercent())
                .temperatureZoneMin(entity.getTemperatureZoneMin())
                .temperatureZoneMax(entity.getTemperatureZoneMax())
                .isActive(entity.isActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public StockItemResponse toStockItemResponse(StockItemEn entity) {
        if (entity == null) return null;
        return StockItemResponse.builder()
                .id(entity.getId())
                .sku(entity.getProduct() != null ? entity.getProduct().getSku() : null)
                .name(entity.getProduct() != null ? entity.getProduct().getName() : null)
                .category(entity.getProduct() != null && entity.getProduct().getCategory() != null
                        ? entity.getProduct().getCategory().getName() : null)
                .warehouseId(entity.getWarehouse() != null ? entity.getWarehouse().getId() : null)
                .warehouseName(entity.getWarehouse() != null ? entity.getWarehouse().getName() : null)
                .quantityAvailable(entity.getQuantityAvailable())
                .quantityReserved(entity.getQuantityReserved())
                .unit(entity.getProduct() != null ? entity.getProduct().getUnit() : null)
                .unitPrice(entity.getProduct() != null ? entity.getProduct().getUnitPrice() : null)
                .status(entity.getStatus() != null ? entity.getStatus().name() : null)
                .batchNumber(entity.getBatchNumber())
                .lotNumber(entity.getLotNumber())
                .expiryDate(entity.getExpiryDate())
                .lastCountedAt(entity.getLastCountedAt())
                .build();
    }
}
