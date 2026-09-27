package com.marianciuc.nexifly.logistic.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "carriers", schema = "logistics")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarrierEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "carrier_type", nullable = false, length = 32)
    private String carrierType;

    @Column(name = "license_number", length = 64)
    private String licenseNumber;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;
}
