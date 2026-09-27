package com.marianciuc.nexifly.orders.repository;

import com.marianciuc.nexifly.orders.domain.entity.OrderStatusHistoryEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistoryEn, UUID> {
    List<OrderStatusHistoryEn> findByOrderIdOrderByCreatedAtAsc(UUID orderId);
}
