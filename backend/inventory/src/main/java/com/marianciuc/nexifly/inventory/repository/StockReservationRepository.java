package com.marianciuc.nexifly.inventory.repository;

import com.marianciuc.nexifly.inventory.repository.entity.StockReservationEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StockReservationRepository extends JpaRepository<StockReservationEn, UUID> {
    List<StockReservationEn> findByOrderId(UUID orderId);
    List<StockReservationEn> findByOrderIdAndStatus(UUID orderId, String status);
}
