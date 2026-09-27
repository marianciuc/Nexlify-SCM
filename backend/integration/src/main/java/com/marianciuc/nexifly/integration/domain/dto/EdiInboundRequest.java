package com.marianciuc.nexifly.integration.domain.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for receiving an inbound EDI message.
 * Supports EDIFACT D.96A messages: ORDERS, DESADV, INVOIC.
 */
@Data
@Schema(description = "Inbound EDI message payload")
public class EdiInboundRequest {

    @NotBlank
    @Pattern(regexp = "ORDERS|DESADV|INVOIC",
            message = "messageType must be one of ORDERS, DESADV, INVOIC")
    @Schema(description = "EDI message type", example = "ORDERS", allowableValues = {"ORDERS", "DESADV", "INVOIC"})
    private String messageType;

    @NotBlank
    @Size(max = 64)
    @Schema(description = "Sender GLN (Global Location Number) 13 digits", example = "5906040027456")
    private String senderGln;

    @NotBlank
    @Size(max = 64)
    @Schema(description = "Receiver GLN (Global Location Number) 13 digits", example = "5906040027457")
    private String receiverGln;

    @Pattern(regexp = "EDIFACT_D96A|PEPPOL_BIS_3_0",
            message = "standard must be EDIFACT_D96A or PEPPOL_BIS_3_0")
    @Schema(description = "EDI standard", example = "EDIFACT_D96A", defaultValue = "EDIFACT_D96A")
    private String standard = "EDIFACT_D96A";

    @NotBlank
    @Schema(description = "Raw EDI message body (UNB/UNH/UNT/UNZ envelope or Peppol XML)")
    private String rawContent;

    @Schema(description = "Related order number in Nexlify (for DESADV / INVOIC correlation)", example = "ORD-2026-00123")
    private String relatedOrderNumber;
}
