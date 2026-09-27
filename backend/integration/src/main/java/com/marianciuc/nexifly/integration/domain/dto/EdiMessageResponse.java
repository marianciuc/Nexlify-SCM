package com.marianciuc.nexifly.integration.domain.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@Schema(description = "EDI message response")
public class EdiMessageResponse {

    @Schema(description = "Internal UUID of the message")
    private UUID id;

    @Schema(description = "Unique message reference / interchange control number")
    private String messageReference;

    @Schema(description = "Message type: ORDERS, DESADV, INVOIC")
    private String messageType;

    @Schema(description = "Message standard: EDIFACT_D96A, PEPPOL_BIS_3_0")
    private String standard;

    @Schema(description = "Direction: INBOUND or OUTBOUND")
    private String direction;

    @Schema(description = "Sender GLN")
    private String senderGln;

    @Schema(description = "Receiver GLN")
    private String receiverGln;

    @Schema(description = "Related Nexlify order number")
    private String relatedOrderNumber;

    @Schema(description = "Processing status: RECEIVED, VALIDATED, PROCESSED, ERROR")
    private String status;

    @Schema(description = "Validation error details (if any)")
    private String validationErrors;

    @Schema(description = "Human-readable error message")
    private String errorMessage;

    @Schema(description = "Timestamp when the message was received")
    private Instant createdAt;

    @Schema(description = "Timestamp when the message was fully processed")
    private Instant processedAt;
}
