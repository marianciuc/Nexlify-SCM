package com.marianciuc.nexifly.integration.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marianciuc.nexifly.integration.domain.dto.EdiInboundRequest;
import com.marianciuc.nexifly.integration.domain.dto.EdiMessageResponse;
import com.marianciuc.nexifly.integration.domain.entity.EdiMessage;
import com.marianciuc.nexifly.integration.kafka.IntegrationEventProducer;
import com.marianciuc.nexifly.integration.repository.EdiMessageRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * EDI Hub service — validates and persists EDIFACT / Peppol messages,
 * then emits corresponding Kafka events to downstream microservices.
 *
 * Message types:
 *  - ORDERS  → triggers order creation via order-events topic
 *  - DESADV  → triggers shipment-advice update via order-events topic
 *  - INVOIC  → stored for billing reconciliation (no Kafka event, billing polls)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EdiService {

    private final EdiMessageRepository ediMessageRepository;
    private final IntegrationEventProducer eventProducer;
    private final ObjectMapper objectMapper;

    /**
     * Accepts an inbound EDI message, persists it, validates basic envelope,
     * and dispatches the appropriate Kafka event.
     */
    public EdiMessageResponse receiveInboundMessage(EdiInboundRequest request) {
        String ref = generateMessageReference(request.getMessageType());

        if (ediMessageRepository.existsByMessageReference(ref)) {
            ref = ref + "-" + UUID.randomUUID().toString().substring(0, 8);
        }

        EdiMessage message = EdiMessage.builder()
                .messageReference(ref)
                .messageType(request.getMessageType())
                .standard(request.getStandard() != null ? request.getStandard() : "EDIFACT_D96A")
                .direction("INBOUND")
                .senderGln(request.getSenderGln())
                .receiverGln(request.getReceiverGln())
                .relatedOrderNumber(request.getRelatedOrderNumber())
                .rawContent(request.getRawContent())
                .status("RECEIVED")
                .build();

        message = ediMessageRepository.save(message);

        // Validate envelope and update status
        String validationError = validateEdiEnvelope(request);
        if (validationError != null) {
            message.setStatus("ERROR");
            message.setErrorMessage(validationError);
            message.setProcessedAt(Instant.now());
            ediMessageRepository.save(message);
            log.warn("EDI message {} failed validation: {}", ref, validationError);
            return toResponse(message);
        }

        // Parse into simplified JSON payload
        String parsedPayload = buildParsedPayload(request);
        message.setParsedPayload(parsedPayload);
        message.setStatus("VALIDATED");

        // Dispatch Kafka events based on message type
        switch (request.getMessageType()) {
            case "ORDERS" -> {
                eventProducer.publishEdiOrderReceived(
                        message.getId(),
                        request.getRelatedOrderNumber(),
                        request.getSenderGln(),
                        parsedPayload
                );
            }
            case "DESADV" -> {
                if (request.getRelatedOrderNumber() != null) {
                    eventProducer.publishEdiShipmentAdviceReceived(
                            message.getId(),
                            request.getRelatedOrderNumber()
                    );
                }
            }
            case "INVOIC" -> {
                log.info("INVOIC message {} received — stored for billing reconciliation", ref);
            }
        }

        message.setStatus("PROCESSED");
        message.setProcessedAt(Instant.now());
        message = ediMessageRepository.save(message);

        log.info("EDI message {} [{}] processed successfully", ref, request.getMessageType());
        return toResponse(message);
    }

    @Transactional(readOnly = true)
    public EdiMessageResponse getById(UUID id) {
        return toResponse(ediMessageRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("EDI message not found: " + id)));
    }

    @Transactional(readOnly = true)
    public Page<EdiMessageResponse> getByType(String messageType, Pageable pageable) {
        return ediMessageRepository.findByMessageType(messageType, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<EdiMessageResponse> getByOrderNumber(String orderNumber, Pageable pageable) {
        return ediMessageRepository.findByRelatedOrderNumber(orderNumber, pageable).map(this::toResponse);
    }

    // ========================= Private helpers =========================

    private String generateMessageReference(String messageType) {
        return "EDI-" + messageType + "-" + System.currentTimeMillis();
    }

    /**
     * Minimal envelope validation: checks raw content is not blank
     * and contains the expected segment identifiers for EDIFACT.
     */
    private String validateEdiEnvelope(EdiInboundRequest request) {
        String raw = request.getRawContent().trim();
        if (raw.isBlank()) return "Raw EDI content is empty";

        if ("EDIFACT_D96A".equals(request.getStandard())) {
            if (!raw.contains("UNB") && !raw.contains("UNH")) {
                return "EDIFACT envelope missing UNB/UNH segments";
            }
        }
        // PEPPOL_BIS_3_0 is XML — just check it starts with '<'
        if ("PEPPOL_BIS_3_0".equals(request.getStandard())) {
            if (!raw.startsWith("<")) {
                return "Peppol BIS 3.0 message must be valid XML";
            }
        }
        return null;
    }

    private String buildParsedPayload(EdiInboundRequest request) {
        try {
            return objectMapper.writeValueAsString(java.util.Map.of(
                    "messageType", request.getMessageType(),
                    "senderGln", request.getSenderGln(),
                    "receiverGln", request.getReceiverGln(),
                    "standard", request.getStandard() != null ? request.getStandard() : "EDIFACT_D96A",
                    "relatedOrderNumber", request.getRelatedOrderNumber() != null ? request.getRelatedOrderNumber() : "",
                    "rawLength", request.getRawContent().length()
            ));
        } catch (Exception e) {
            log.warn("Failed to build parsed payload: {}", e.getMessage());
            return "{}";
        }
    }

    private EdiMessageResponse toResponse(EdiMessage m) {
        return EdiMessageResponse.builder()
                .id(m.getId())
                .messageReference(m.getMessageReference())
                .messageType(m.getMessageType())
                .standard(m.getStandard())
                .direction(m.getDirection())
                .senderGln(m.getSenderGln())
                .receiverGln(m.getReceiverGln())
                .relatedOrderNumber(m.getRelatedOrderNumber())
                .status(m.getStatus())
                .validationErrors(m.getValidationErrors())
                .errorMessage(m.getErrorMessage())
                .createdAt(m.getCreatedAt())
                .processedAt(m.getProcessedAt())
                .build();
    }
}
