package com.marianciuc.nexifly.rfq.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marianciuc.nexifly.rfq.kafka.events.RfqAwardedEvent;
import com.marianciuc.nexifly.rfq.kafka.events.RfqBidReceivedEvent;
import com.marianciuc.nexifly.rfq.kafka.events.RfqPublishedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RfqProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publishRfqPublished(RfqPublishedEvent event) {
        log.info("Publishing RfqPublishedEvent: rfqNumber={}", event.rfqNumber());
        send("rfq-events", event.rfqId().toString(), event);
    }

    public void publishRfqAwarded(RfqAwardedEvent event) {
        log.info("Publishing RfqAwardedEvent: rfqNumber={}, winningBidId={}", event.rfqNumber(), event.winningBidId());
        send("rfq-events", event.rfqId().toString(), event);
    }

    public void publishBidReceived(RfqBidReceivedEvent event) {
        log.info("Publishing RfqBidReceivedEvent: rfqId={}, bidId={}", event.rfqId(), event.bidId());
        send("rfq-events", event.rfqId().toString(), event);
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
