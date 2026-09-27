package com.marianciuc.nexifly.users.kafka.events;

import java.time.Instant;
import java.util.UUID;

public record CompanyBlockedEvent(
        UUID companyId,
        String reason,
        Instant blockedAt
) {}
