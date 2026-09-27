package com.marianciuc.nexifly.notification.service;

import com.marianciuc.nexifly.notification.domain.dto.NotificationRequest;
import com.marianciuc.nexifly.notification.domain.dto.NotificationResponse;
import com.marianciuc.nexifly.notification.domain.dto.UserNotificationSettingsDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface NotificationService {
    NotificationResponse send(NotificationRequest request);
    Page<NotificationResponse> getUserNotifications(UUID userId, Pageable pageable);
    long getUnreadCount(UUID userId);
    NotificationResponse markAsRead(UUID notificationId, UUID userId);
    void markAllAsRead(UUID userId);
    UserNotificationSettingsDto getSettings(UUID userId);
    UserNotificationSettingsDto updateSettings(UUID userId, UserNotificationSettingsDto settings);
    void broadcast(String destinationTopic, Object message);
}
