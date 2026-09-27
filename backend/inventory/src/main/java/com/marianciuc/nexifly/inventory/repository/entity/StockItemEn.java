package com.marianciuc.nexifly.inventory.repository.entity;

import com.marianciuc.nexifly.inventory.domain.enums.StockStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "stock_items", schema = "inventory",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_stock_product_warehouse_batch",
                columnNames = {"product_id", "warehouse_id", "batch_number"}
        ))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockItemEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEn product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private WarehouseEn warehouse;

    @Column(name = "quantity_available", nullable = false)
    @Builder.Default
    private int quantityAvailable = 0;

    @Column(name = "quantity_reserved", nullable = false)
    @Builder.Default
    private int quantityReserved = 0;

    @Column(name = "batch_number", length = 100)
    private String batchNumber;

    @Column(name = "lot_number", length = 100)
    private String lotNumber;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private StockStatus status = StockStatus.IN_STOCK;

    @Column(name = "last_counted_at")
    private Instant lastCountedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        recalculateStatus();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
        recalculateStatus();
    }

    /**
     * Soft-reserves stock. Moves quantity from available to reserved.
     *
     * @throws IllegalStateException if insufficient available stock
     */
    public void reserve(int quantity) {
        if (quantity > quantityAvailable) {
            throw new IllegalStateException(
                    "Cannot reserve %d units — only %d available (SKU: %s, Warehouse: %s)"
                            .formatted(quantity, quantityAvailable,
                                    product != null ? product.getSku() : "?",
                                    warehouse != null ? warehouse.getCode() : "?"));
        }
        this.quantityAvailable -= quantity;
        this.quantityReserved += quantity;
        recalculateStatus();
    }

    /**
     * Releases reserved stock back to available.
     */
    public void release(int quantity) {
        int toRelease = Math.min(quantity, this.quantityReserved);
        this.quantityReserved -= toRelease;
        this.quantityAvailable += toRelease;
        recalculateStatus();
    }

    /**
     * Automatically determines stock status based on quantity thresholds.
     */
    public void recalculateStatus() {
        if (this.quantityAvailable == 0 && this.quantityReserved == 0) {
            this.status = StockStatus.OUT_OF_STOCK;
        } else if (this.quantityAvailable <= (product != null ? product.getReorderPoint() : 10)) {
            this.status = StockStatus.LOW_STOCK;
        } else {
            this.status = StockStatus.IN_STOCK;
        }
    }
}
