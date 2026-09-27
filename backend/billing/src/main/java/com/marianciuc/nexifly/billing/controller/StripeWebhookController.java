package com.marianciuc.nexifly.billing.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marianciuc.nexifly.billing.domain.entity.InvoiceEn;
import com.marianciuc.nexifly.billing.domain.entity.PaymentEventEn;
import com.marianciuc.nexifly.billing.repository.InvoiceRepository;
import com.marianciuc.nexifly.billing.repository.PaymentEventRepository;
import com.marianciuc.nexifly.billing.service.BillingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/billing/webhooks")
@RequiredArgsConstructor
public class StripeWebhookController {

    private final BillingService billingService;
    private final PaymentEventRepository paymentEventRepository;
    private final InvoiceRepository invoiceRepository;
    private final ObjectMapper objectMapper;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String signature
    ) {
        log.info("Received Stripe webhook: signature present={}", signature != null);
        try {
            JsonNode root = objectMapper.readTree(payload);
            String eventId = root.has("id") ? root.get("id").asText() : UUID.randomUUID().toString();
            String eventType = root.has("type") ? root.get("type").asText() : "unknown";

            // Idempotency check
            if (paymentEventRepository.existsByStripeEventId(eventId)) {
                log.info("Duplicate Stripe event id: {}, skipping", eventId);
                return ResponseEntity.ok("Already processed");
            }

            BigDecimal amount = BigDecimal.ZERO;
            String currency = "pln";
            UUID invoiceId = null;

            if (root.has("data") && root.get("data").has("object")) {
                JsonNode obj = root.get("data").get("object");
                if (obj.has("amount")) {
                    amount = new BigDecimal(obj.get("amount").asText()).divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);
                }
                if (obj.has("currency")) {
                    currency = obj.get("currency").asText();
                }
                if (obj.has("metadata") && obj.get("metadata").has("invoice_id")) {
                    try {
                        invoiceId = UUID.fromString(obj.get("metadata").get("invoice_id").asText());
                    } catch (Exception ignored) {}
                }
                if (invoiceId == null && obj.has("id")) {
                    String intentId = obj.get("id").asText();
                    Optional<InvoiceEn> invOpt = invoiceRepository.findByStripePaymentIntentId(intentId);
                    if (invOpt.isPresent()) {
                        invoiceId = invOpt.get().getId();
                    }
                }
            }

            if ("payment_intent.succeeded".equalsIgnoreCase(eventType) && invoiceId != null) {
                billingService.markInvoiceAsPaid(invoiceId, eventId, "STRIPE");
                log.info("Successfully marked invoice {} as PAID via Stripe webhook", invoiceId);
            }

            PaymentEventEn eventEn = PaymentEventEn.builder()
                    .invoiceId(invoiceId)
                    .stripeEventId(eventId)
                    .eventType(eventType)
                    .amount(amount)
                    .currency(currency)
                    .processedAt(Instant.now())
                    .rawPayload(payload)
                    .build();

            paymentEventRepository.save(eventEn);

            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            log.error("Failed to process Stripe webhook: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
