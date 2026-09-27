package com.marianciuc.nexifly.notification.domain.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record UserNotificationSettingsDto(
        UUID userId,
        boolean emailEnabled,
        boolean pushEnabled,
        boolean webEnabled,
        boolean orderNotifications,
        boolean stockNotifications,
        boolean invoiceNotifications,
        boolean logisticsNotifications
) {}
