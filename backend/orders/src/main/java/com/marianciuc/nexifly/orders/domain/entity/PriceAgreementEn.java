package com.marianciuc.nexifly.orders.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "price_agreements", schema = "orders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceAgreementEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "buyer_company_id", nullable = false)
    private UUID buyerCompanyId;

    @Column(name = "supplier_company_id", nullable = false)
    private UUID supplierCompanyId;

    @Column(name = "sku", nullable = false)
    private String sku;

    @Column(name = "agreed_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal agreedPrice;

    @Column(name = "discount_percent", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPercent = BigDecimal.ZERO;

    @Column(name = "payment_terms")
    @Builder.Default
    private String paymentTerms = "NET_30";

    @Column(name = "valid_from", nullable = false)
    private LocalDate validFrom;

    @Column(name = "valid_to")
    private LocalDate validTo;

    @Column(name = "min_order_quantity")
    @Builder.Default
    private Integer minOrderQuantity = 1;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        if (this.minOrderQuantity == null) this.minOrderQuantity = 1;
        if (this.discountPercent == null) this.discountPercent = BigDecimal.ZERO;
        if (this.paymentTerms == null) this.paymentTerms = "NET_30";
    }
}
