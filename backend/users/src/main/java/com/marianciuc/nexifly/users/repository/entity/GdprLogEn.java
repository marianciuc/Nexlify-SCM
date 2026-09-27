package com.marianciuc.nexifly.users.repository.entity;

import com.marianciuc.nexifly.users.domain.enums.GdprOperations;
import com.marianciuc.nexifly.users.domain.enums.GdprReason;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "gdpr_logs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GdprLogEn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEn user;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation", nullable = false)
    private GdprOperations operation;

    @Enumerated(EnumType.STRING)
    @Column(name = "gdpr_reason", nullable = false)
    private GdprReason gdprReason;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }
}
