package com.marianciuc.nexifly.notification.repository;

import com.marianciuc.nexifly.notification.domain.entity.UserNotificationSettingsEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserNotificationSettingsRepository extends JpaRepository<UserNotificationSettingsEn, UUID> {
    Optional<UserNotificationSettingsEn> findByUserId(UUID userId);
}
