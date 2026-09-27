package com.marianciuc.nexifly.billing.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marianciuc.nexifly.billing.kafka.events.InvoiceIssuedEvent;
import com.marianciuc.nexifly.billing.kafka.events.PaymentFailedEvent;
import com.marianciuc.nexifly.billing.kafka.events.PaymentSucceededEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BillingProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publishPaymentSucceeded(PaymentSucceededEvent event) {
        log.info("Publishing PaymentSucceededEvent: orderId={}, amount={}", event.orderId(), event.amount());
        send("payment-events", event.orderId().toString(), event);
    }

    public void publishPaymentFailed(PaymentFailedEvent event) {
        log.info("Publishing PaymentFailedEvent: orderId={}, reason={}", event.orderId(), event.reason());
        send("payment-events", event.orderId().toString(), event);
    }

    public void publishInvoiceIssued(InvoiceIssuedEvent event) {
        log.info("Publishing InvoiceIssuedEvent: invoiceNumber={}, orderId={}", event.invoiceNumber(), event.orderId());
        send("billing-events", event.orderId().toString(), event);
    }

    private void send(String topic, String key, Object payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            kafkaTemplate.send(topic, key, json);
        } catch (Exception e) {
            log.error("Failed to serialize or send event to topic {}: {}", topic, e.getMessage(), e);
        }
    }
}
