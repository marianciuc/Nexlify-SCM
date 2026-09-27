package com.marianciuc.nexifly.users.repository.entity;

import com.marianciuc.nexifly.users.domain.enums.OrganizationType;
import com.marianciuc.nexifly.users.domain.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "companies")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "legal_name", nullable = false)
    private String legalName;

    @Column(name = "trade_name")
    private String tradeName;

    @Column(name = "tax_id", nullable = false, unique = true)
    private String taxId;

    @Column(name = "registration_code")
    private String registrationCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "organization_type", nullable = false)
    @Builder.Default
    private OrganizationType organizationType = OrganizationType.BUYER;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.NOT_VERIFIED;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "website")
    private String website;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private boolean isDeleted = false;

    @Column(name = "rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal rating = BigDecimal.ZERO;

    @Column(name = "number_of_orders", nullable = false)
    @Builder.Default
    private long numberOfOrders = 0;

    @Column(name = "number_of_ratings", nullable = false)
    @Builder.Default
    private long numberOfRatings = 0;

    @Column(name = "vies_valid", nullable = false)
    @Builder.Default
    private boolean viesValid = false;

    @Column(name = "payments_terms_days", nullable = false)
    @Builder.Default
    private int paymentsTermsDays = 0;

    @Column(name = "credit_limit", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal creditLimit = BigDecimal.ZERO;

    @Column(name = "credit_used", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal creditUsed = BigDecimal.ZERO;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CompanyLocationEn> locations = new ArrayList<>();

    @OneToMany(mappedBy = "company")
    @Builder.Default
    private List<UserEn> employees = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.creditLimit == null) this.creditLimit = BigDecimal.ZERO;
        if (this.creditUsed == null) this.creditUsed = BigDecimal.ZERO;
        if (this.rating == null) this.rating = BigDecimal.ZERO;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public void verify(BigDecimal approvedCreditLimit, int termsDays) {
        this.verificationStatus = VerificationStatus.VERIFIED;
        this.creditLimit = approvedCreditLimit != null ? approvedCreditLimit : BigDecimal.ZERO;
        this.paymentsTermsDays = termsDays;
    }

    public void reject() {
        this.verificationStatus = VerificationStatus.REJECTED;
    }

    public void block() {
        this.isDeleted = true;
        this.deletedAt = Instant.now();
    }
}
