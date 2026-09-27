package com.marianciuc.nexifly.orders.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "consumed_events", schema = "orders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsumedEventEn {

    @Id
    @Column(name = "event_id")
    private String eventId;

    @Column(name = "consumed_at", nullable = false, updatable = false)
    private Instant consumedAt;

    public ConsumedEventEn(String eventId) {
        this.eventId = eventId;
        this.consumedAt = Instant.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.consumedAt == null) {
            this.consumedAt = Instant.now();
        }
    }
}
