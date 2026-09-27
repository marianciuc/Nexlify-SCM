package com.marianciuc.nexifly.billing.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "credit_notes", schema = "billing")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditNoteEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "credit_note_number", unique = true, nullable = false, length = 64)
    private String creditNoteNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_invoice_id", nullable = false)
    private InvoiceEn originalInvoice;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "net_adjustment", nullable = false, precision = 15, scale = 2)
    private BigDecimal netAdjustment;

    @Column(name = "vat_adjustment", nullable = false, precision = 15, scale = 2)
    private BigDecimal vatAdjustment;

    @Column(name = "gross_adjustment", nullable = false, precision = 15, scale = 2)
    private BigDecimal grossAdjustment;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private String status = "ISSUED";

    @Column(name = "pdf_url", columnDefinition = "TEXT")
    private String pdfUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        if (this.status == null) this.status = "ISSUED";
    }
}
