package com.marianciuc.nexifly.notification.domain.dto;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record NotificationResponse(
        UUID id,
        UUID recipientUserId,
        UUID recipientCompanyId,
        String notificationType,
        String title,
        String body,
        String data,
        String channel,
        String status,
        Instant readAt,
        Instant createdAt
) {}
