package com.marianciuc.nexifly.notification.scheduler;

import com.marianciuc.nexifly.notification.domain.dto.NotificationResponse;
import com.marianciuc.nexifly.notification.domain.entity.NotificationEn;
import com.marianciuc.nexifly.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class NotificationRetryScheduler {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void retryFailedNotifications() {
        List<NotificationEn> failedNotifications = notificationRepository.findByStatus("FAILED");
        if (failedNotifications.isEmpty()) {
            return;
        }

        log.info("Retrying {} failed notifications", failedNotifications.size());
        for (NotificationEn notification : failedNotifications) {
            try {
                if ("WEB".equalsIgnoreCase(notification.getChannel()) && notification.getRecipientUserId() != null) {
                    NotificationResponse response = NotificationResponse.builder()
                            .id(notification.getId())
                            .recipientUserId(notification.getRecipientUserId())
                            .recipientCompanyId(notification.getRecipientCompanyId())
                            .notificationType(notification.getNotificationType())
                            .title(notification.getTitle())
                            .body(notification.getBody())
                            .data(notification.getData())
                            .channel(notification.getChannel())
                            .status("SENT")
                            .readAt(notification.getReadAt())
                            .createdAt(notification.getCreatedAt())
                            .build();

                    messagingTemplate.convertAndSendToUser(
                            notification.getRecipientUserId().toString(),
                            "/queue/notifications",
                            response
                    );

                    notification.setStatus("SENT");
                    notification.setSentAt(Instant.now());
                    notificationRepository.save(notification);
                }
            } catch (Exception e) {
                log.warn("Retry failed for notification id {}: {}", notification.getId(), e.getMessage());
            }
        }
    }
}
