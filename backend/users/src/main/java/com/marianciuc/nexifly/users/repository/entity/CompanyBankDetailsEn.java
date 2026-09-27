package com.marianciuc.nexifly.users.repository.entity;

import com.marianciuc.nexifly.users.domain.enums.Currency;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "company_bank_details")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyBankDetailsEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private CompanyEn company;

    @Column(name = "bank_name", nullable = false)
    private String bankName;

    @Column(name = "iban", nullable = false)
    private String iban;

    @Column(name = "swift")
    private String swift;

    @Enumerated(EnumType.STRING)
    @Column(name = "currency", nullable = false)
    @Builder.Default
    private Currency currency = Currency.PLN;

    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private boolean isPrimary = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        if (this.currency == null) this.currency = Currency.PLN;
    }
}
