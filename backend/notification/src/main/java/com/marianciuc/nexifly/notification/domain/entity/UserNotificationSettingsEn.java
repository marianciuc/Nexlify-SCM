package com.marianciuc.nexifly.notification.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_notification_settings", schema = "notifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserNotificationSettingsEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", unique = true, nullable = false)
    private UUID userId;

    @Column(name = "email_enabled", nullable = false)
    @Builder.Default
    private boolean emailEnabled = true;

    @Column(name = "push_enabled", nullable = false)
    @Builder.Default
    private boolean pushEnabled = true;

    @Column(name = "web_enabled", nullable = false)
    @Builder.Default
    private boolean webEnabled = true;

    @Column(name = "order_notifications", nullable = false)
    @Builder.Default
    private boolean orderNotifications = true;

    @Column(name = "stock_notifications", nullable = false)
    @Builder.Default
    private boolean stockNotifications = true;

    @Column(name = "invoice_notifications", nullable = false)
    @Builder.Default
    private boolean invoiceNotifications = true;

    @Column(name = "logistics_notifications", nullable = false)
    @Builder.Default
    private boolean logisticsNotifications = true;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    public void prePersist() {
        this.updatedAt = Instant.now();
    }
}
