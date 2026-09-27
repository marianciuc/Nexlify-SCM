package com.marianciuc.nexifly.users.service;

import com.marianciuc.nexifly.users.domain.enums.GdprOperations;
import com.marianciuc.nexifly.users.domain.enums.GdprReason;

import java.util.UUID;

public interface GdprService {

    void logOperation(UUID userId, GdprOperations operation, GdprReason reason, String details);

    void processDataDeletion(UUID userId, String reason, String initiator);
}
