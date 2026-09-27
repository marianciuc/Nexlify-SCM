package com.marianciuc.nexifly.integration.controller;

import com.marianciuc.nexifly.integration.domain.dto.EdiInboundRequest;
import com.marianciuc.nexifly.integration.domain.dto.EdiMessageResponse;
import com.marianciuc.nexifly.integration.service.EdiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * EDI Hub REST API.
 *
 * Endpoints:
 *  POST /api/v1/integration/edi/inbound       — receive ORDERS/DESADV/INVOIC from ERP
 *  GET  /api/v1/integration/edi/{id}          — retrieve a single message
 *  GET  /api/v1/integration/edi               — list messages with filters
 *  GET  /api/v1/integration/edi/order/{number} — messages correlated to an order
 */
@RestController
@RequestMapping("/api/v1/integration/edi")
@RequiredArgsConstructor
@Tag(name = "EDI Hub", description = "Endpoints for B2B electronic document interchange (EDIFACT ORDERS / DESADV / INVOIC, Peppol BIS 3.0)")
public class EdiController {

    private final EdiService ediService;

    @PostMapping("/inbound")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(
            summary = "Receive inbound EDI message",
            description = """
                    Accepts an EDI message (ORDERS, DESADV or INVOIC) from a trading partner's ERP.
                    The message is validated, persisted, and triggers corresponding Kafka events
                    to the Order or Inventory microservices.
                    """,
            responses = {
                    @ApiResponse(responseCode = "202", description = "Message accepted and queued for processing"),
                    @ApiResponse(responseCode = "400", description = "Invalid request payload")
            }
    )
    public ResponseEntity<EdiMessageResponse> receiveInbound(@Valid @RequestBody EdiInboundRequest request) {
        EdiMessageResponse response = ediService.receiveInboundMessage(request);
        return ResponseEntity.accepted().body(response);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get EDI message by ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Message found"),
                    @ApiResponse(responseCode = "404", description = "Message not found")
            }
    )
    public ResponseEntity<EdiMessageResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ediService.getById(id));
    }

    @GetMapping
    @Operation(
            summary = "List EDI messages",
            description = "Returns paginated list of EDI messages, optionally filtered by type."
    )
    public ResponseEntity<Page<EdiMessageResponse>> list(
            @Parameter(description = "Filter by message type: ORDERS, DESADV, INVOIC")
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (type != null && !type.isBlank()) {
            return ResponseEntity.ok(ediService.getByType(type, pageable));
        }
        return ResponseEntity.ok(ediService.getByType("ORDERS", pageable));
    }

    @GetMapping("/order/{orderNumber}")
    @Operation(
            summary = "Get EDI messages for a specific order",
            description = "Returns all EDI messages (ORDERS, DESADV, INVOIC) correlated to the given order number."
    )
    public ResponseEntity<Page<EdiMessageResponse>> getByOrder(
            @PathVariable String orderNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ediService.getByOrderNumber(orderNumber, pageable));
    }
}
