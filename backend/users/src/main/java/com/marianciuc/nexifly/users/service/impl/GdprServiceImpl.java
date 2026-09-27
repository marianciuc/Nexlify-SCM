package com.marianciuc.nexifly.users.service.impl;

import com.marianciuc.nexifly.users.domain.enums.GdprOperations;
import com.marianciuc.nexifly.users.domain.enums.GdprReason;
import com.marianciuc.nexifly.users.exception.UserNotFoundException;
import com.marianciuc.nexifly.users.repository.GdprLogRepository;
import com.marianciuc.nexifly.users.repository.UserRepository;
import com.marianciuc.nexifly.users.repository.entity.GdprLogEn;
import com.marianciuc.nexifly.users.repository.entity.UserEn;
import com.marianciuc.nexifly.users.service.GdprService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GdprServiceImpl implements GdprService {

    private final UserRepository userRepository;
    private final GdprLogRepository gdprLogRepository;

    @Override
    @Transactional
    public void logOperation(UUID userId, GdprOperations operation, GdprReason reason, String details) {
        UserEn user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        GdprLogEn logEntry = GdprLogEn.builder()
                .user(user)
                .operation(operation)
                .gdprReason(reason)
                .details(details)
                .build();

        gdprLogRepository.save(logEntry);
        log.info("Logged GDPR operation {} for user {}", operation, userId);
    }

    @Override
    @Transactional
    public void processDataDeletion(UUID userId, String reason, String initiator) {
        UserEn user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        user.softDelete(reason, initiator);
        userRepository.save(user);

        logOperation(userId, GdprOperations.DATA_DELETION, GdprReason.USER_REQUEST,
                "User personal data soft-deleted by: " + initiator + ", reason: " + reason);
        log.info("Soft-deleted user {} under GDPR compliance", userId);
    }
}
