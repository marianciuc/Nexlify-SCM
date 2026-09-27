package com.marianciuc.nexifly.logistic.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic logisticsEventsTopic() {
        return TopicBuilder.name("logistics-events")
                .partitions(3)
                .replicas(1)
                .build();
    }
}
