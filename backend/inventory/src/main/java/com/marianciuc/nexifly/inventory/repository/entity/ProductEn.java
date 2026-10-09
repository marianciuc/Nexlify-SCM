package com.marianciuc.nexifly.inventory.repository.entity;

import com.marianciuc.nexifly.inventory.domain.enums.Units;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "products", schema = "inventory")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductEn extends BaseAuditableEntityEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "sku", nullable = false, unique = true, length = 50)
    private String sku;

    @Column(name = "name", nullable = false, length = 300)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private CategoryEn category;

    @Enumerated(EnumType.STRING)
    @Column(name = "unit", nullable = false, length = 30)
    @Builder.Default
    private Units unit = Units.PCS;

    @Column(name = "unit_price", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "currency", length = 3)
    @Builder.Default
    private String currencyCode = "PLN";

    @Column(name = "weight_kg", precision = 10, scale = 3)
    private BigDecimal weightKg;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private ProductDimensionsEn dimensions;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private BrandEn brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manufacturer_id")
    private ManufacturerEn manufacturer;

    @Column(name = "min_order_quantity")
    @Builder.Default
    private Integer minOrderQuantity = 1;

    @Column(name = "reorder_point")
    @Builder.Default
    private Integer reorderPoint = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StockItemEn> stockItems = new ArrayList<>();

    public void setDimensions(ProductDimensionsEn dimensions) {
        this.dimensions = dimensions;
        if (dimensions != null) {
            dimensions.setProduct(this);
        }
    }

    public String getBrandName() {
        return brand != null ? brand.getName() : null;
    }

    public String getManufacturerName() {
        return manufacturer != null ? manufacturer.getName() : null;
    }

    /**
     * Computes total available quantity across all warehouses.
     */
    public int getTotalAvailable() {
        return stockItems.stream().mapToInt(StockItemEn::getQuantityAvailable).sum();
    }

    /**
     * Computes total reserved quantity across all warehouses.
     */
    public int getTotalReserved() {
        return stockItems.stream().mapToInt(StockItemEn::getQuantityReserved).sum();
    }
}
