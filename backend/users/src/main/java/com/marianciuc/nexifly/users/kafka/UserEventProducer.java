package com.marianciuc.nexifly.users.kafka;

import com.marianciuc.nexifly.users.config.KafkaTopicConfig;
import com.marianciuc.nexifly.users.kafka.events.CompanyBlockedEvent;
import com.marianciuc.nexifly.users.kafka.events.CompanyVerifiedEvent;
import com.marianciuc.nexifly.users.kafka.events.UserDeletedEvent;
import com.marianciuc.nexifly.users.kafka.events.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class UserEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendCompanyVerified(CompanyVerifiedEvent event) {
        log.info("Publishing CompanyVerifiedEvent for company: {}", event.companyId());
        kafkaTemplate.send(KafkaTopicConfig.USER_EVENTS_TOPIC, event.companyId().toString(), event);
    }

    public void sendCompanyBlocked(CompanyBlockedEvent event) {
        log.info("Publishing CompanyBlockedEvent for company: {}", event.companyId());
        kafkaTemplate.send(KafkaTopicConfig.USER_EVENTS_TOPIC, event.companyId().toString(), event);
    }

    public void sendUserRegistered(UserRegisteredEvent event) {
        log.info("Publishing UserRegisteredEvent for user: {}", event.userId());
        kafkaTemplate.send(KafkaTopicConfig.USER_EVENTS_TOPIC, event.userId().toString(), event);
    }

    public void sendUserDeleted(UserDeletedEvent event) {
        log.info("Publishing UserDeletedEvent for user: {}", event.userId());
        kafkaTemplate.send(KafkaTopicConfig.USER_EVENTS_TOPIC, event.userId().toString(), event);
    }
}
