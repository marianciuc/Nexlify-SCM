package com.marianciuc.nexifly.inventory.repository.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
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
public class ProductEn {

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

    @Column(name = "unit", nullable = false, length = 30)
    @Builder.Default
    private String unit = "pcs";

    @Column(name = "unit_price", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "currency", length = 3)
    @Builder.Default
    private String currency = "PLN";

    @Column(name = "weight_kg", precision = 10, scale = 3)
    private BigDecimal weightKg;

    @Column(name = "dimensions", length = 100)
    private String dimensions;

    @Column(name = "manufacturer", length = 200)
    private String manufacturer;

    @Column(name = "brand", length = 200)
    private String brand;

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

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
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
