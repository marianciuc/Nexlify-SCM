package com.marianciuc.nexifly.logistic.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "vehicles", schema = "logistics")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrier_id", nullable = false)
    private CarrierEn carrier;

    @Column(name = "plate_number", unique = true, nullable = false, length = 32)
    private String plateNumber;

    @Column(name = "vehicle_type", nullable = false, length = 32)
    private String vehicleType;

    @Column(name = "max_weight_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal maxWeightKg;

    @Column(name = "max_volume_m3", nullable = false, precision = 10, scale = 2)
    private BigDecimal maxVolumeM3;

    @Column(name = "has_refrigeration")
    @Builder.Default
    private Boolean hasRefrigeration = false;

    @Column(name = "has_adr_cert")
    @Builder.Default
    private Boolean hasAdrCert = false;

    @Column(name = "fuel_type", length = 16)
    @Builder.Default
    private String fuelType = "DIESEL";

    @Column(name = "fuel_consumption_l_per_100km", precision = 5, scale = 2)
    private BigDecimal fuelConsumptionLPer100km;

    @Column(name = "current_location_lat", precision = 10, scale = 7)
    private BigDecimal currentLocationLat;

    @Column(name = "current_location_lon", precision = 10, scale = 7)
    private BigDecimal currentLocationLon;

    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private String status = "AVAILABLE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        if (this.status == null) this.status = "AVAILABLE";
        if (this.fuelType == null) this.fuelType = "DIESEL";
    }
}
