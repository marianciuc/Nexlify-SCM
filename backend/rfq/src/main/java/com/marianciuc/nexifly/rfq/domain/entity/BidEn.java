package com.marianciuc.nexifly.rfq.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "bids", schema = "rfq")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rfq_id", nullable = false)
    @JsonIgnore
    private RfqRequestEn rfq;

    @Column(name = "supplier_company_id", nullable = false)
    private UUID supplierCompanyId;

    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private String status = "SUBMITTED"; // SUBMITTED, UNDER_REVIEW, ACCEPTED, REJECTED, WITHDRAWN

    @Column(name = "total_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "currency", nullable = false, length = 3)
    @Builder.Default
    private String currency = "PLN";

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(name = "payment_terms", length = 16)
    private String paymentTerms;

    @Column(name = "validity_days", nullable = false)
    @Builder.Default
    private Integer validityDays = 30;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "score", precision = 5, scale = 2)
    private BigDecimal score;

    @OneToMany(mappedBy = "bid", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BidItemEn> items = new ArrayList<>();

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private Instant submittedAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        this.submittedAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.status == null) this.status = "SUBMITTED";
        if (this.currency == null) this.currency = "PLN";
        if (this.validityDays == null) this.validityDays = 30;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public void addItem(BidItemEn item) {
        items.add(item);
        item.setBid(this);
    }
}
