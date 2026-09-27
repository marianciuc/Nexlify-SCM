package com.marianciuc.nexifly.notification.repository;

import com.marianciuc.nexifly.notification.domain.entity.NotificationEn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEn, UUID> {
    Page<NotificationEn> findByRecipientUserIdOrderByCreatedAtDesc(UUID recipientUserId, Pageable pageable);
    long countByRecipientUserIdAndStatus(UUID recipientUserId, String status);
    List<NotificationEn> findByRecipientUserIdAndStatus(UUID recipientUserId, String status);
    List<NotificationEn> findByStatus(String status);
}
