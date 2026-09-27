package com.marianciuc.nexifly.billing.repository;

import com.marianciuc.nexifly.billing.domain.entity.PaymentEventEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentEventRepository extends JpaRepository<PaymentEventEn, UUID> {
    boolean existsByStripeEventId(String stripeEventId);
    Optional<PaymentEventEn> findByStripeEventId(String stripeEventId);
}
