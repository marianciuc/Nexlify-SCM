package com.marianciuc.nexifly.analytics.kafka.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marianciuc.nexifly.analytics.domain.entity.OrderFactEn;
import com.marianciuc.nexifly.analytics.domain.entity.PaymentFactEn;
import com.marianciuc.nexifly.analytics.domain.entity.StockFactEn;
import com.marianciuc.nexifly.analytics.repository.OrderFactRepository;
import com.marianciuc.nexifly.analytics.repository.PaymentFactRepository;
import com.marianciuc.nexifly.analytics.repository.StockFactRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class AnalyticsEventConsumer {

    private final OrderFactRepository orderFactRepository;
    private final StockFactRepository stockFactRepository;
    private final PaymentFactRepository paymentFactRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "order-events", groupId = "analytics-order-group")
    @Transactional
    public void consumeOrderEvent(String message) {
        log.info("Analytics received order-event: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            String eventType = root.has("eventType") ? root.get("eventType").asText() : "";
            String orderIdStr = root.has("orderId") ? root.get("orderId").asText() : null;

            if (orderIdStr == null || orderIdStr.isBlank()) return;
            UUID orderId = UUID.fromString(orderIdStr);

            if ("ORDER_CREATED".equalsIgnoreCase(eventType)) {
                UUID tenantId = root.has("tenantId") ? UUID.fromString(root.get("tenantId").asText()) : UUID.randomUUID();
                UUID customerId = root.has("customerId") ? UUID.fromString(root.get("customerId").asText()) : UUID.randomUUID();
                BigDecimal total = root.has("totalAmount") ? new BigDecimal(root.get("totalAmount").asText()) : BigDecimal.ZERO;
                int items = root.has("items") && root.get("items").isArray() ? root.get("items").size() : 1;

                OrderFactEn fact = OrderFactEn.builder()
                        .id(orderId)
                        .tenantId(tenantId)
                        .customerId(customerId)
                        .status("CREATED")
                        .currency("PLN")
                        .totalAmount(total)
                        .createdDate(LocalDate.now())
                        .submittedDate(LocalDate.now())
                        .itemsCount(items)
                        .isOnTime(true)
                        .isInFull(true)
                        .slaMet(true)
                        .build();
                orderFactRepository.save(fact);
            } else {
                Optional<OrderFactEn> opt = orderFactRepository.findById(orderId);
                if (opt.isPresent()) {
                    OrderFactEn fact = opt.get();
                    fact.setStatus(eventType);
                    if ("ORDER_SHIPPED".equalsIgnoreCase(eventType)) {
                        fact.setShippedDate(LocalDate.now());
                    } else if ("ORDER_DELIVERED".equalsIgnoreCase(eventType)) {
                        fact.setDeliveredDate(LocalDate.now());
                        if (fact.getCreatedDate() != null) {
                            int days = (int) ChronoUnit.DAYS.between(fact.getCreatedDate(), LocalDate.now());
                            fact.setLeadTimeDays(Math.max(days, 1));
                            fact.setIsOnTime(days <= 3); // standard SLA 3 days
                        }
                    } else if ("ORDER_PAID".equalsIgnoreCase(eventType)) {
                        fact.setPaidDate(LocalDate.now());
                    }
                    orderFactRepository.save(fact);
                }
            }
        } catch (Exception e) {
            log.error("Failed to process order event in Analytics: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "inventory-events", groupId = "analytics-inventory-group")
    @Transactional
    public void consumeInventoryEvent(String message) {
        log.info("Analytics received inventory-event: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            String eventType = root.has("eventType") ? root.get("eventType").asText() : "STOCK_EVENT";
            UUID tenantId = root.has("tenantId") ? UUID.fromString(root.get("tenantId").asText()) : UUID.randomUUID();
            UUID productId = root.has("productId") ? UUID.fromString(root.get("productId").asText()) : UUID.randomUUID();
            int qty = root.has("quantity") ? root.get("quantity").asInt() : 1;

            StockFactEn stock = StockFactEn.builder()
                    .eventDate(LocalDate.now())
                    .tenantId(tenantId)
                    .productId(productId)
                    .eventType(eventType)
                    .quantity(qty)
                    .unitCost(BigDecimal.valueOf(50.00))
                    .totalCost(BigDecimal.valueOf(qty * 50.00))
                    .build();
            stockFactRepository.save(stock);
        } catch (Exception e) {
            log.error("Failed to process inventory event in Analytics: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "payment-events", groupId = "analytics-payment-group")
    @Transactional
    public void consumePaymentEvent(String message) {
        log.info("Analytics received payment-event: {}", message);
        try {
            JsonNode root = objectMapper.readTree(message);
            String eventType = root.has("eventType") ? root.get("eventType").asText() : "";
            UUID orderId = root.has("orderId") ? UUID.fromString(root.get("orderId").asText()) : UUID.randomUUID();
            BigDecimal amount = root.has("amount") ? new BigDecimal(root.get("amount").asText()) : BigDecimal.valueOf(1000.00);

            PaymentFactEn payment = PaymentFactEn.builder()
                    .invoiceId(UUID.randomUUID())
                    .orderId(orderId)
                    .buyerCompanyId(UUID.randomUUID())
                    .supplierCompanyId(UUID.randomUUID())
                    .netAmount(amount.multiply(BigDecimal.valueOf(0.81)))
                    .vatAmount(amount.multiply(BigDecimal.valueOf(0.19)))
                    .grossAmount(amount)
                    .currency("PLN")
                    .paymentTerms("NET_30")
                    .issueDate(LocalDate.now())
                    .paidDate("PAYMENT_SUCCEEDED".equalsIgnoreCase(eventType) ? LocalDate.now() : null)
                    .daysToPay(1)
                    .isOverdue(false)
                    .build();
            paymentFactRepository.save(payment);
        } catch (Exception e) {
            log.error("Failed to process payment event in Analytics: {}", e.getMessage(), e);
        }
    }
}
