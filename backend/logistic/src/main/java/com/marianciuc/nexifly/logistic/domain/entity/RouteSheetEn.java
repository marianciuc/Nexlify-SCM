package com.marianciuc.nexifly.logistic.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "route_sheets", schema = "logistics")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteSheetEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "route_number", unique = true, nullable = false, length = 64)
    private String routeNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private VehicleEn vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private DriverEn driver;

    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private String status = "PLANNED"; // PLANNED, DISPATCHED, IN_TRANSIT, COMPLETED, CANCELLED

    @Column(name = "planned_departure")
    private Instant plannedDeparture;

    @Column(name = "actual_departure")
    private Instant actualDeparture;

    @Column(name = "planned_arrival")
    private Instant plannedArrival;

    @Column(name = "actual_arrival")
    private Instant actualArrival;

    @Column(name = "total_distance_km", precision = 10, scale = 2)
    private BigDecimal totalDistanceKm;

    @Column(name = "total_weight_kg", precision = 10, scale = 2)
    private BigDecimal totalWeightKg;

    @Column(name = "fuel_consumed_l", precision = 8, scale = 2)
    private BigDecimal fuelConsumedL;

    @Column(name = "graphhopper_route_json", columnDefinition = "JSONB")
    private String graphhopperRouteJson;

    @Column(name = "ecmr_number", length = 64)
    private String ecmrNumber;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "routeSheet", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DeliveryStopEn> stops = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        if (this.status == null) this.status = "PLANNED";
    }

    public void addStop(DeliveryStopEn stop) {
        stops.add(stop);
        stop.setRouteSheet(this);
    }
}
