package com.marianciuc.nexifly.orders.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    public static final String ORDER_EVENTS_TOPIC = "order-events";
    public static final String INVENTORY_EVENTS_TOPIC = "inventory-events";
    public static final String PAYMENT_EVENTS_TOPIC = "payment-events";
    public static final String LOGISTICS_EVENTS_TOPIC = "logistics-events";

    @Bean
    public NewTopic orderEventsTopic() {
        return TopicBuilder.name(ORDER_EVENTS_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
