package com.marianciuc.nexifly.billing.kafka.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marianciuc.nexifly.billing.domain.dto.CreditNoteRequest;
import com.marianciuc.nexifly.billing.domain.dto.InvoiceCreateRequest;
import com.marianciuc.nexifly.billing.domain.dto.InvoiceDetailResponse;
import com.marianciuc.nexifly.billing.domain.dto.InvoiceLineRequest;
import com.marianciuc.nexifly.billing.service.BillingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final BillingService billingService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "order-events", groupId = "billing-order-group")
    public void consumeOrderEvent(String message) {
        log.info("BillingService received order event: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            String eventType = root.has("eventType") ? root.get("eventType").asText() : "";
            String orderIdStr = root.has("orderId") ? root.get("orderId").asText() : null;

            if (orderIdStr == null || orderIdStr.isBlank()) {
                return;
            }

            UUID orderId = UUID.fromString(orderIdStr);

            if ("ORDER_RESERVED".equalsIgnoreCase(eventType) || "STOCK_RESERVED".equalsIgnoreCase(eventType)) {
                // Check if invoice already exists
                try {
                    billingService.getInvoiceByOrderId(orderId);
                    log.info("Invoice already exists for order: {}", orderId);
                    return;
                } catch (IllegalArgumentException notFound) {
                    // Create invoice
                }

                UUID buyerCompanyId = root.has("buyerCompanyId") ? UUID.fromString(root.get("buyerCompanyId").asText()) : UUID.randomUUID();
                UUID sellerCompanyId = root.has("sellerCompanyId") ? UUID.fromString(root.get("sellerCompanyId").asText()) : UUID.randomUUID();

                List<InvoiceLineRequest> lines = new ArrayList<>();
                if (root.has("items") && root.get("items").isArray()) {
                    int lineNo = 1;
                    for (JsonNode item : root.get("items")) {
                        lines.add(InvoiceLineRequest.builder()
                                .lineNumber(lineNo++)
                                .sku(item.has("sku") ? item.get("sku").asText() : "SKU-ORDER")
                                .description(item.has("productName") ? item.get("productName").asText() : "Ordered Product")
                                .quantity(item.has("quantity") ? new BigDecimal(item.get("quantity").asText()) : BigDecimal.ONE)
                                .unitOfMeasure("PCE")
                                .unitPriceNet(item.has("unitPrice") ? new BigDecimal(item.get("unitPrice").asText()) : new BigDecimal("100.00"))
                                .discountPercent(BigDecimal.ZERO)
                                .vatRate(new BigDecimal("23.00"))
                                .build());
                    }
                }

                if (lines.isEmpty()) {
                    BigDecimal totalAmount = root.has("totalAmount") ? new BigDecimal(root.get("totalAmount").asText()) : new BigDecimal("1000.00");
                    lines.add(InvoiceLineRequest.builder()
                            .lineNumber(1)
                            .sku("SKU-BULK")
                            .description("Goods from order " + orderId)
                            .quantity(BigDecimal.ONE)
                            .unitOfMeasure("LOT")
                            .unitPriceNet(totalAmount)
                            .discountPercent(BigDecimal.ZERO)
                            .vatRate(new BigDecimal("23.00"))
                            .build());
                }

                InvoiceCreateRequest req = InvoiceCreateRequest.builder()
                        .orderId(orderId)
                        .sellerCompanyId(sellerCompanyId)
                        .buyerCompanyId(buyerCompanyId)
                        .sellerNip("PL5213456789")
                        .buyerNip("PL8522619472")
                        .sellerName("Nexlify Supply Sp. z o.o.")
                        .buyerName("Client Enterprise Sp. k.")
                        .paymentTerms("NET_30")
                        .paymentMethod("BANK_TRANSFER")
                        .currency("PLN")
                        .lines(lines)
                        .build();

                billingService.createInvoice(req);
                log.info("Issued invoice for order: {}", orderId);
            } else if ("ORDER_CANCELLED".equalsIgnoreCase(eventType)) {
                try {
                    InvoiceDetailResponse inv = billingService.getInvoiceByOrderId(orderId);
                    if ("PAID".equalsIgnoreCase(inv.status()) || "ISSUED".equalsIgnoreCase(inv.status())) {
                        billingService.createCreditNote(CreditNoteRequest.builder()
                                .originalInvoiceId(inv.id())
                                .reason("Order cancelled by buyer or system: " + orderId)
                                .netAdjustment(inv.netAmount().negate())
                                .vatAdjustment(inv.vatAmount().negate())
                                .build());
                    }
                } catch (IllegalArgumentException ignored) {}
            }
        } catch (Exception e) {
            log.error("Failed to process order event in BillingService: {}", e.getMessage(), e);
        }
    }
}
