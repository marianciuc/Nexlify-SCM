package com.marianciuc.nexifly.inventory.repository.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "manufacturers", schema = "inventory")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManufacturerEn extends BaseAuditableEntityEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "code", length = 100, unique = true)
    private String code;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "website", length = 255)
    private String website;

    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @OneToMany(mappedBy = "manufacturer", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @Builder.Default
    private List<ProductEn> products = new ArrayList<>();
}
