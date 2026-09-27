package com.marianciuc.nexifly.billing.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment_events", schema = "billing")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEventEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "invoice_id")
    private UUID invoiceId;

    @Column(name = "stripe_event_id", unique = true)
    private String stripeEventId;

    @Column(name = "event_type", nullable = false, length = 64)
    private String eventType;

    @Column(name = "amount", precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(name = "processed_at", nullable = false)
    private Instant processedAt;

    @Column(name = "raw_payload", columnDefinition = "TEXT")
    private String rawPayload;

    @PrePersist
    public void prePersist() {
        if (this.processedAt == null) {
            this.processedAt = Instant.now();
        }
    }
}
