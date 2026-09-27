package com.marianciuc.nexifly.notification.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications", schema = "notifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "recipient_user_id", nullable = false)
    private UUID recipientUserId;

    @Column(name = "recipient_company_id")
    private UUID recipientCompanyId;

    @Column(name = "notification_type", nullable = false)
    private String notificationType;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "data", columnDefinition = "TEXT")
    private String data;

    @Column(name = "channel", nullable = false)
    @Builder.Default
    private String channel = "WEB"; // WEB, EMAIL, PUSH, SMS

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "PENDING"; // PENDING, SENT, READ, FAILED

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        if (this.channel == null) this.channel = "WEB";
        if (this.status == null) this.status = "PENDING";
    }

    public void markAsRead() {
        this.status = "READ";
        this.readAt = Instant.now();
    }
}
