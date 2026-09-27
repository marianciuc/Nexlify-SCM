package com.marianciuc.nexifly.users.repository.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "company_locations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyLocationEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private CompanyEn company;

    @Column(name = "location_name", nullable = false)
    private String locationName;

    @Column(name = "location_type", nullable = false)
    private String locationType; // LEGAL, WAREHOUSE, DELIVERY_POINT

    @Column(name = "street", nullable = false)
    private String street;

    @Column(name = "building_number", nullable = false)
    private String buildingNumber;

    @Column(name = "zip", nullable = false)
    private String zip;

    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "country", nullable = false)
    @Builder.Default
    private String country = "PL";

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.isDefault == null) this.isDefault = false;
        if (this.country == null) this.country = "PL";
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
