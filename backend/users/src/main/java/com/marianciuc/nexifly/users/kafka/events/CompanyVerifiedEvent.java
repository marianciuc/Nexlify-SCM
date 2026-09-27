package com.marianciuc.nexifly.users.kafka.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CompanyVerifiedEvent(
        UUID companyId,
        String legalName,
        String taxId,
        String organizationType,
        BigDecimal creditLimit,
        int paymentTermsDays,
        Instant verifiedAt
) {}
