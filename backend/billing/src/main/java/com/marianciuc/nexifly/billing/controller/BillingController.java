package com.marianciuc.nexifly.billing.controller;

import com.marianciuc.nexifly.billing.domain.dto.*;
import com.marianciuc.nexifly.billing.service.BillingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @GetMapping("/invoices")
    public ResponseEntity<Page<InvoiceDetailResponse>> getInvoices(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantIdHeader,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        UUID tenantId = tenantIdHeader != null && !tenantIdHeader.isBlank() ? UUID.fromString(tenantIdHeader) : null;
        return ResponseEntity.ok(billingService.getInvoices(tenantId, status, pageable));
    }

    @GetMapping("/invoices/{id}")
    public ResponseEntity<InvoiceDetailResponse> getInvoiceById(@PathVariable UUID id) {
        return ResponseEntity.ok(billingService.getInvoiceById(id));
    }

    @GetMapping("/invoices/order/{orderId}")
    public ResponseEntity<InvoiceDetailResponse> getInvoiceByOrderId(@PathVariable UUID orderId) {
        return ResponseEntity.ok(billingService.getInvoiceByOrderId(orderId));
    }

    @PostMapping("/invoices")
    public ResponseEntity<InvoiceDetailResponse> createInvoice(@RequestBody InvoiceCreateRequest request) {
        log.info("Creating invoice for order: {}", request.orderId());
        return ResponseEntity.ok(billingService.createInvoice(request));
    }

    @PostMapping("/invoices/{id}/pay")
    public ResponseEntity<InvoiceDetailResponse> payInvoice(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "BANK_TRANSFER") String paymentMethod,
            @RequestParam(required = false) String transactionId
    ) {
        return ResponseEntity.ok(billingService.markInvoiceAsPaid(id, transactionId, paymentMethod));
    }

    @PostMapping("/invoices/{id}/payment-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@PathVariable UUID id) {
        String clientSecret = billingService.createPaymentIntent(id);
        return ResponseEntity.ok(Map.of("clientSecret", clientSecret));
    }

    @PostMapping("/credit-notes")
    public ResponseEntity<CreditNoteResponse> createCreditNote(@RequestBody CreditNoteRequest request) {
        return ResponseEntity.ok(billingService.createCreditNote(request));
    }

    @GetMapping("/credit-notes")
    public ResponseEntity<List<CreditNoteResponse>> getCreditNotes(@RequestParam UUID orderId) {
        return ResponseEntity.ok(billingService.getCreditNotes(orderId));
    }

    @GetMapping("/stats")
    public ResponseEntity<BillingStatsResponse> getStats(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantIdHeader
    ) {
        UUID tenantId = tenantIdHeader != null && !tenantIdHeader.isBlank() ? UUID.fromString(tenantIdHeader) : null;
        return ResponseEntity.ok(billingService.getBillingStats(tenantId));
    }

    @PostMapping("/payments/charge")
    public ResponseEntity<Map<String, Object>> processPayment(@RequestBody Map<String, Object> paymentReq) {
        String invoiceIdStr = (String) paymentReq.get("invoiceId");
        log.info("Processing legacy payment endpoint for invoice: {}", invoiceIdStr);

        if (invoiceIdStr != null) {
            try {
                UUID id = UUID.fromString(invoiceIdStr);
                billingService.markInvoiceAsPaid(id, "txn_stripe_sim_" + UUID.randomUUID().toString().substring(0, 8), "STRIPE");
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "transactionId", "txn_stripe_sim_" + UUID.randomUUID().toString().substring(0, 8),
                "status", "SUCCEEDED",
                "paymentMethod", "PL_SPLIT_PAYMENT_NET30"
        ));
    }
}
