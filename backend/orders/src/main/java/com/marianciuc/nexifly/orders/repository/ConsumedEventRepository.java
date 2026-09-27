package com.marianciuc.nexifly.orders.repository;

import com.marianciuc.nexifly.orders.domain.entity.ConsumedEventEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConsumedEventRepository extends JpaRepository<ConsumedEventEn, String> {
}
