package com.marianciuc.nexifly.users.kafka.events;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record UserRegisteredEvent(
        UUID userId,
        UUID companyId,
        String email,
        String firstName,
        String lastName,
        List<String> roles,
        Instant registeredAt
) {}
