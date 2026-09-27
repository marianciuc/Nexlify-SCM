package com.marianciuc.nexifly.users.repository.entity;

import com.marianciuc.nexifly.users.domain.enums.AccountStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "keycloak_id", unique = true)
    private String keycloakId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private CompanyEn company;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    @Builder.Default
    private AccountStatus accountStatus = AccountStatus.PENDING;

    @Column(name = "is_email_verified", nullable = false)
    @Builder.Default
    private boolean isEmailVerified = false;

    @Column(name = "data_processing_consent", nullable = false)
    @Builder.Default
    private boolean dataProcessingConsent = false;

    @Column(name = "timezone", nullable = false)
    @Builder.Default
    private String timezone = "Europe/Warsaw";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private boolean isDeleted = false;

    @Column(name = "deleted_by")
    private String deletedBy;

    @Column(name = "deleted_reason")
    private String deletedReason;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.accountStatus == null) this.accountStatus = AccountStatus.PENDING;
        if (this.timezone == null) this.timezone = "Europe/Warsaw";
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public void activate() {
        this.accountStatus = AccountStatus.ACTIVE;
    }

    public void block() {
        this.accountStatus = AccountStatus.BLOCKED;
    }

    public void softDelete(String reason, String initiator) {
        this.isDeleted = true;
        this.deletedAt = Instant.now();
        this.deletedReason = reason;
        this.deletedBy = initiator;
        this.accountStatus = AccountStatus.DELETED;
    }
}
