package com.marianciuc.nexifly.orders.repository;

import com.marianciuc.nexifly.orders.domain.entity.OrderEn;
import com.marianciuc.nexifly.orders.domain.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<OrderEn, UUID> {
    Optional<OrderEn> findByOrderNumber(String orderNumber);
    Page<OrderEn> findByCustomerId(UUID customerId, Pageable pageable);
    Page<OrderEn> findBySupplierId(UUID supplierId, Pageable pageable);
    Page<OrderEn> findByStatus(OrderStatus status, Pageable pageable);
    long countByStatus(OrderStatus status);
}
