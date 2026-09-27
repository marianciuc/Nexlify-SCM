package com.marianciuc.nexifly.integration.repository;

import com.marianciuc.nexifly.integration.domain.entity.EdiMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EdiMessageRepository extends JpaRepository<EdiMessage, UUID> {

    Optional<EdiMessage> findByMessageReference(String messageReference);

    Page<EdiMessage> findByMessageType(String messageType, Pageable pageable);

    Page<EdiMessage> findByStatus(String status, Pageable pageable);

    Page<EdiMessage> findByRelatedOrderNumber(String relatedOrderNumber, Pageable pageable);

    boolean existsByMessageReference(String messageReference);
}
