package com.marianciuc.nexifly.integration.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

/**
 * EDI Message — входящее/исходящее сообщение в формате EDIFACT или Peppol BIS 3.0.
 * message_type: ORDERS, DESADV, INVOIC
 * direction: INBOUND (от внешней ERP) / OUTBOUND (в внешнюю ERP)
 * standard: EDIFACT_D96A, PEPPOL_BIS_3_0
 */
@Entity
@Table(name = "edi_messages", schema = "integration")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EdiMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "message_reference", nullable = false, unique = true, length = 64)
    private String messageReference;

    @Column(name = "message_type", nullable = false, length = 32)
    private String messageType;

    @Column(name = "standard", nullable = false, length = 32)
    @Builder.Default
    private String standard = "EDIFACT_D96A";

    @Column(name = "direction", nullable = false, length = 16)
    private String direction;

    @Column(name = "sender_gln", nullable = false, length = 64)
    private String senderGln;

    @Column(name = "receiver_gln", nullable = false, length = 64)
    private String receiverGln;

    @Column(name = "sender_company_id")
    private UUID senderCompanyId;

    @Column(name = "receiver_company_id")
    private UUID receiverCompanyId;

    @Column(name = "related_order_id")
    private UUID relatedOrderId;

    @Column(name = "related_order_number", length = 64)
    private String relatedOrderNumber;

    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private String status = "RECEIVED";

    @Column(name = "raw_content", nullable = false, columnDefinition = "TEXT")
    private String rawContent;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "parsed_payload", columnDefinition = "jsonb")
    private String parsedPayload;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "validation_errors", columnDefinition = "jsonb")
    private String validationErrors;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "processed_at")
    private Instant processedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        if (this.status == null) this.status = "RECEIVED";
        if (this.standard == null) this.standard = "EDIFACT_D96A";
    }
}
