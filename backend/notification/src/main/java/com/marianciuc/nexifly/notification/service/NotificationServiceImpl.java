package com.marianciuc.nexifly.notification.service;

import com.marianciuc.nexifly.notification.domain.dto.NotificationRequest;
import com.marianciuc.nexifly.notification.domain.dto.NotificationResponse;
import com.marianciuc.nexifly.notification.domain.dto.UserNotificationSettingsDto;
import com.marianciuc.nexifly.notification.domain.entity.NotificationEn;
import com.marianciuc.nexifly.notification.domain.entity.UserNotificationSettingsEn;
import com.marianciuc.nexifly.notification.repository.NotificationRepository;
import com.marianciuc.nexifly.notification.repository.UserNotificationSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserNotificationSettingsRepository settingsRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public NotificationResponse send(NotificationRequest request) {
        log.info("Dispatching notification: recipient={}, type={}, title='{}'",
                request.recipientUserId(), request.notificationType(), request.title());

        UserNotificationSettingsEn settings = settingsRepository.findByUserId(request.recipientUserId())
                .orElseGet(() -> createDefaultSettings(request.recipientUserId()));

        if (!isNotificationAllowed(request.notificationType(), settings)) {
            log.info("Notification type {} is disabled by user settings for userId={}",
                    request.notificationType(), request.recipientUserId());
            return null;
        }

        NotificationEn notification = NotificationEn.builder()
                .recipientUserId(request.recipientUserId())
                .recipientCompanyId(request.recipientCompanyId())
                .notificationType(request.notificationType())
                .title(request.title())
                .body(request.body())
                .data(request.data())
                .channel(request.channel() != null ? request.channel() : "WEB")
                .status("PENDING")
                .build();

        notification = notificationRepository.save(notification);

        // Push real-time over WebSocket if web channel enabled
        if (settings.isWebEnabled()) {
            NotificationResponse response = mapToResponse(notification);
            try {
                messagingTemplate.convertAndSendToUser(
                        request.recipientUserId().toString(),
                        "/queue/notifications",
                        response
                );
                notification.setStatus("SENT");
                notification.setSentAt(Instant.now());
                notification = notificationRepository.save(notification);
            } catch (Exception e) {
                log.warn("Failed to deliver WebSocket message to user {}: {}", request.recipientUserId(), e.getMessage());
            }
        }

        return mapToResponse(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getUserNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByRecipientUserIdAndStatus(userId, "PENDING")
                + notificationRepository.countByRecipientUserIdAndStatus(userId, "SENT");
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(UUID notificationId, UUID userId) {
        NotificationEn notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + notificationId));

        if (!notification.getRecipientUserId().equals(userId)) {
            throw new IllegalStateException("Unauthorized access to notification: " + notificationId);
        }

        notification.markAsRead();
        notification = notificationRepository.save(notification);
        return mapToResponse(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(UUID userId) {
        List<NotificationEn> unreadPending = notificationRepository.findByRecipientUserIdAndStatus(userId, "PENDING");
        List<NotificationEn> unreadSent = notificationRepository.findByRecipientUserIdAndStatus(userId, "SENT");

        unreadPending.forEach(NotificationEn::markAsRead);
        unreadSent.forEach(NotificationEn::markAsRead);

        notificationRepository.saveAll(unreadPending);
        notificationRepository.saveAll(unreadSent);
    }

    @Override
    @Transactional
    public UserNotificationSettingsDto getSettings(UUID userId) {
        UserNotificationSettingsEn settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettings(userId));
        return mapToSettingsDto(settings);
    }

    @Override
    @Transactional
    public UserNotificationSettingsDto updateSettings(UUID userId, UserNotificationSettingsDto dto) {
        UserNotificationSettingsEn settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettings(userId));

        settings.setEmailEnabled(dto.emailEnabled());
        settings.setPushEnabled(dto.pushEnabled());
        settings.setWebEnabled(dto.webEnabled());
        settings.setOrderNotifications(dto.orderNotifications());
        settings.setStockNotifications(dto.stockNotifications());
        settings.setInvoiceNotifications(dto.invoiceNotifications());
        settings.setLogisticsNotifications(dto.logisticsNotifications());

        settings = settingsRepository.save(settings);
        return mapToSettingsDto(settings);
    }

    @Override
    public void broadcast(String destinationTopic, Object message) {
        log.info("Broadcasting to /topic/{}: {}", destinationTopic, message);
        messagingTemplate.convertAndSend("/topic/" + destinationTopic, message);
    }

    private boolean isNotificationAllowed(String type, UserNotificationSettingsEn settings) {
        if (type == null) return true;
        if (type.startsWith("ORDER_") && !settings.isOrderNotifications()) return false;
        if (type.startsWith("STOCK_") && !settings.isStockNotifications()) return false;
        if (type.startsWith("INVOICE_") && !settings.isInvoiceNotifications()) return false;
        if (type.startsWith("LOGISTICS_") && !settings.isLogisticsNotifications()) return false;
        return true;
    }

    private UserNotificationSettingsEn createDefaultSettings(UUID userId) {
        UserNotificationSettingsEn entity = UserNotificationSettingsEn.builder()
                .userId(userId)
                .emailEnabled(true)
                .pushEnabled(true)
                .webEnabled(true)
                .orderNotifications(true)
                .stockNotifications(true)
                .invoiceNotifications(true)
                .logisticsNotifications(true)
                .build();
        return settingsRepository.save(entity);
    }

    private NotificationResponse mapToResponse(NotificationEn entity) {
        return NotificationResponse.builder()
                .id(entity.getId())
                .recipientUserId(entity.getRecipientUserId())
                .recipientCompanyId(entity.getRecipientCompanyId())
                .notificationType(entity.getNotificationType())
                .title(entity.getTitle())
                .body(entity.getBody())
                .data(entity.getData())
                .channel(entity.getChannel())
                .status(entity.getStatus())
                .readAt(entity.getReadAt())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private UserNotificationSettingsDto mapToSettingsDto(UserNotificationSettingsEn entity) {
        return UserNotificationSettingsDto.builder()
                .userId(entity.getUserId())
                .emailEnabled(entity.isEmailEnabled())
                .pushEnabled(entity.isPushEnabled())
                .webEnabled(entity.isWebEnabled())
                .orderNotifications(entity.isOrderNotifications())
                .stockNotifications(entity.isStockNotifications())
                .invoiceNotifications(entity.isInvoiceNotifications())
                .logisticsNotifications(entity.isLogisticsNotifications())
                .build();
    }
}
