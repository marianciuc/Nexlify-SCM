package com.marianciuc.nexifly.rfq.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "requests", schema = "rfq")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RfqRequestEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "rfq_number", unique = true, nullable = false, length = 64)
    private String rfqNumber;

    @Column(name = "buyer_company_id", nullable = false)
    private UUID buyerCompanyId;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category", length = 128)
    private String category;

    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private String status = "DRAFT"; // DRAFT, PUBLISHED, EVALUATING, AWARDED, CANCELLED, EXPIRED

    @Column(name = "deadline", nullable = false)
    private Instant deadline;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(name = "delivery_address", columnDefinition = "TEXT")
    private String deliveryAddress;

    @Column(name = "delivery_city", length = 128)
    private String deliveryCity;

    @Column(name = "budget_amount", precision = 15, scale = 2)
    private BigDecimal budgetAmount;

    @Column(name = "budget_hidden")
    @Builder.Default
    private Boolean budgetHidden = false;

    @Column(name = "currency", nullable = false, length = 3)
    @Builder.Default
    private String currency = "PLN";

    @Column(name = "payment_terms", length = 16)
    @Builder.Default
    private String paymentTerms = "NET_30";

    @Column(name = "awarded_bid_id")
    private UUID awardedBidId;

    @OneToMany(mappedBy = "rfq", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RfqItemEn> items = new ArrayList<>();

    @OneToMany(mappedBy = "rfq", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BidEn> bids = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.status == null) this.status = "DRAFT";
        if (this.currency == null) this.currency = "PLN";
        if (this.paymentTerms == null) this.paymentTerms = "NET_30";
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public void addItem(RfqItemEn item) {
        items.add(item);
        item.setRfq(this);
    }

    public void addBid(BidEn bid) {
        bids.add(bid);
        bid.setRfq(this);
    }
}
