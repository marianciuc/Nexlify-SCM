package com.marianciuc.nexifly.logistic.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "delivery_stops", schema = "logistics")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryStopEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_sheet_id", nullable = false)
    @JsonIgnore
    private RouteSheetEn routeSheet;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(name = "stop_sequence", nullable = false)
    private Integer stopSequence;

    @Column(name = "address", nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "city", nullable = false, length = 128)
    private String city;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "planned_arrival")
    private Instant plannedArrival;

    @Column(name = "actual_arrival")
    private Instant actualArrival;

    @Column(name = "planned_departure")
    private Instant plannedDeparture;

    @Column(name = "actual_departure")
    private Instant actualDeparture;

    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private String status = "PENDING"; // PENDING, ARRIVED, DELIVERED, FAILED

    @Column(name = "signature_name", length = 128)
    private String signatureName;

    @Column(name = "proof_of_delivery_url", columnDefinition = "TEXT")
    private String proofOfDeliveryUrl;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @PrePersist
    public void prePersist() {
        if (this.status == null) this.status = "PENDING";
    }
}
