package com.marianciuc.nexifly.inventory.repository.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "storage_zones", schema = "inventory")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorageZoneEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private WarehouseEn warehouse;

    @Column(name = "code", nullable = false)
    private String code;

    @Column(name = "zone_type", nullable = false)
    private String zoneType; // DRY, COLD, HAZMAT, BULK

    @Column(name = "temperature_min")
    private BigDecimal temperatureMin;

    @Column(name = "temperature_max")
    private BigDecimal temperatureMax;

    @Column(name = "capacity_m3")
    private BigDecimal capacityM3;
}
