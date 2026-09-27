package com.marianciuc.nexifly.notification.controller;

import com.marianciuc.nexifly.notification.domain.dto.NotificationResponse;
import com.marianciuc.nexifly.notification.domain.dto.UserNotificationSettingsDto;
import com.marianciuc.nexifly.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        UUID userId = extractUserId(userIdHeader);
        return ResponseEntity.ok(notificationService.getUserNotifications(userId, pageable));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        UUID userId = extractUserId(userIdHeader);
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        UUID userId = extractUserId(userIdHeader);
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }

    @PostMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        UUID userId = extractUserId(userIdHeader);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @GetMapping("/settings")
    public ResponseEntity<UserNotificationSettingsDto> getSettings(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        UUID userId = extractUserId(userIdHeader);
        return ResponseEntity.ok(notificationService.getSettings(userId));
    }

    @PutMapping("/settings")
    public ResponseEntity<UserNotificationSettingsDto> updateSettings(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestBody UserNotificationSettingsDto settings
    ) {
        UUID userId = extractUserId(userIdHeader);
        return ResponseEntity.ok(notificationService.updateSettings(userId, settings));
    }

    private UUID extractUserId(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isBlank()) {
            return UUID.fromString("00000000-0000-0000-0000-000000000001");
        }
        return UUID.fromString(userIdHeader);
    }
}
