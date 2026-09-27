package com.marianciuc.nexifly.notification.domain.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record NotificationRequest(
        UUID recipientUserId,
        UUID recipientCompanyId,
        String notificationType,
        String title,
        String body,
        String data,
        String channel
) {}
