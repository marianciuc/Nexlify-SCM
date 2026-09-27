package com.marianciuc.nexifly.inventory.repository.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "warehouses", schema = "inventory")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "code", nullable = false, unique = true, length = 30)
    private String code;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "address", length = 300)
    private String address;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "total_capacity_pallets")
    @Builder.Default
    private Integer totalCapacityPallets = 0;

    @Column(name = "utilized_capacity_pallets")
    @Builder.Default
    private Integer utilizedCapacityPallets = 0;

    @Column(name = "temperature_zone_min", precision = 5, scale = 1)
    private BigDecimal temperatureZoneMin;

    @Column(name = "temperature_zone_max", precision = 5, scale = 1)
    private BigDecimal temperatureZoneMax;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL, orphanRemoval = true)
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
     * Calculates warehouse utilization percentage.
     */
    public double getUtilizationPercent() {
        if (totalCapacityPallets == null || totalCapacityPallets == 0) return 0.0;
        return (utilizedCapacityPallets * 100.0) / totalCapacityPallets;
    }
}
