package com.marianciuc.nexifly.logistic.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "drivers", schema = "logistics")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrier_id", nullable = false)
    private CarrierEn carrier;

    @Column(name = "license_number", nullable = false, length = 64)
    private String licenseNumber;

    @Column(name = "license_category", nullable = false, length = 8)
    private String licenseCategory;

    @Column(name = "adr_cert_number", length = 64)
    private String adrCertNumber;

    @Column(name = "adr_cert_expires")
    private LocalDate adrCertExpires;

    @Column(name = "is_available", nullable = false)
    @Builder.Default
    private boolean isAvailable = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }
}
