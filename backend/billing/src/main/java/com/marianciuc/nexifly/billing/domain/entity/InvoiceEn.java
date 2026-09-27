package com.marianciuc.nexifly.billing.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "invoices", schema = "billing")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "invoice_number", unique = true, nullable = false, length = 64)
    private String invoiceNumber;

    @Column(name = "invoice_type", nullable = false, length = 16)
    @Builder.Default
    private String invoiceType = "SALES";

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(name = "seller_company_id", nullable = false)
    private UUID sellerCompanyId;

    @Column(name = "buyer_company_id", nullable = false)
    private UUID buyerCompanyId;

    @Column(name = "seller_nip", nullable = false, length = 16)
    private String sellerNip;

    @Column(name = "buyer_nip", nullable = false, length = 16)
    private String buyerNip;

    @Column(name = "seller_name", nullable = false)
    private String sellerName;

    @Column(name = "buyer_name", nullable = false)
    private String buyerName;

    @Column(name = "seller_address", nullable = false, columnDefinition = "TEXT")
    private String sellerAddress;

    @Column(name = "buyer_address", nullable = false, columnDefinition = "TEXT")
    private String buyerAddress;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "sale_date", nullable = false)
    private LocalDate saleDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "payment_terms", nullable = false, length = 16)
    @Builder.Default
    private String paymentTerms = "NET_30";

    @Column(name = "currency", nullable = false, length = 3)
    @Builder.Default
    private String currency = "PLN";

    @Column(name = "net_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal netAmount;

    @Column(name = "vat_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal vatAmount;

    @Column(name = "gross_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal grossAmount;

    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private String status = "DRAFT";

    @Column(name = "payment_method", length = 32)
    @Builder.Default
    private String paymentMethod = "BANK_TRANSFER";

    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;

    @Column(name = "stripe_payment_status", length = 32)
    private String stripePaymentStatus;

    @Column(name = "pdf_url", columnDefinition = "TEXT")
    private String pdfUrl;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InvoiceLineEn> lines = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        if (this.invoiceType == null) this.invoiceType = "SALES";
        if (this.paymentTerms == null) this.paymentTerms = "NET_30";
        if (this.currency == null) this.currency = "PLN";
        if (this.status == null) this.status = "DRAFT";
        if (this.paymentMethod == null) this.paymentMethod = "BANK_TRANSFER";
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public void addLine(InvoiceLineEn line) {
        lines.add(line);
        line.setInvoice(this);
    }
}
