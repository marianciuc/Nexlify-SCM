package com.marianciuc.nexifly.orders.repository;

import com.marianciuc.nexifly.orders.domain.entity.OrderItemEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItemEn, UUID> {
    List<OrderItemEn> findByOrderId(UUID orderId);
}
