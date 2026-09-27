package com.marianciuc.nexifly.orders.repository;

import com.marianciuc.nexifly.orders.domain.entity.OutboxEventEn;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEventEn, UUID> {
    List<OutboxEventEn> findByStatusOrderByCreatedAtAsc(String status, Pageable pageable);
}
