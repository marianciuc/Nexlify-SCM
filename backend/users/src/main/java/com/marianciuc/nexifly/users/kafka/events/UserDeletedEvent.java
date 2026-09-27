package com.marianciuc.nexifly.users.kafka.events;

import java.time.Instant;
import java.util.UUID;

public record UserDeletedEvent(
        UUID userId,
        UUID companyId,
        String reason,
        Instant deletedAt
) {}
