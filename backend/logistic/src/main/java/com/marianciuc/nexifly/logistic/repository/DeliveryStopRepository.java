package com.marianciuc.nexifly.logistic.repository;

import com.marianciuc.nexifly.logistic.domain.entity.DeliveryStopEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeliveryStopRepository extends JpaRepository<DeliveryStopEn, UUID> {
    List<DeliveryStopEn> findByOrderId(UUID orderId);
    Optional<DeliveryStopEn> findByRouteSheetIdAndStopSequence(UUID routeSheetId, Integer stopSequence);
}
