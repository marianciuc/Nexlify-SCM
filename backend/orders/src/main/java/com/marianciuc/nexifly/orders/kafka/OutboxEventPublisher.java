package com.marianciuc.nexifly.orders.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marianciuc.nexifly.orders.config.KafkaTopicConfig;
import com.marianciuc.nexifly.orders.domain.entity.OutboxEventEn;
import com.marianciuc.nexifly.orders.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
@EnableScheduling
@Slf4j
@RequiredArgsConstructor
public class OutboxEventPublisher {

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(propagation = Propagation.MANDATORY)
    public void enqueue(String aggregateType, UUID aggregateId, String eventType, Object payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            OutboxEventEn outbox = OutboxEventEn.builder()
                    .aggregateType(aggregateType)
                    .aggregateId(aggregateId)
                    .eventType(eventType)
                    .payload(json)
                    .status("PENDING")
                    .build();
            outboxEventRepository.save(outbox);
            log.info("Enqueued outbox event {} for aggregate {}", eventType, aggregateId);
        } catch (Exception e) {
            log.error("Failed to enqueue outbox event: {}", e.getMessage(), e);
            throw new RuntimeException("Outbox serialization failure", e);
        }
    }

    @Scheduled(fixedDelay = 3000)
    public void publishPendingEvents() {
        List<OutboxEventEn> events = outboxEventRepository.findByStatusOrderByCreatedAtAsc("PENDING", PageRequest.of(0, 50));
        if (events.isEmpty()) return;

        for (OutboxEventEn event : events) {
            try {
                kafkaTemplate.send(KafkaTopicConfig.ORDER_EVENTS_TOPIC, event.getAggregateId().toString(), event.getPayload())
                        .whenComplete((result, ex) -> {
                            if (ex == null) {
                                event.setStatus("SENT");
                                event.setSentAt(Instant.now());
                                outboxEventRepository.save(event);
                                log.debug("Published outbox event {} (id: {})", event.getEventType(), event.getId());
                            } else {
                                log.error("Failed to send Kafka event {}: {}", event.getId(), ex.getMessage());
                            }
                        });
            } catch (Exception e) {
                log.error("Error publishing outbox event {}: {}", event.getId(), e.getMessage());
            }
        }
    }
}
