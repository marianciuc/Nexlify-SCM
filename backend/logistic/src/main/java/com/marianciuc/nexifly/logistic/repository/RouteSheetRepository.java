package com.marianciuc.nexifly.logistic.repository;

import com.marianciuc.nexifly.logistic.domain.entity.RouteSheetEn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RouteSheetRepository extends JpaRepository<RouteSheetEn, UUID> {
    Optional<RouteSheetEn> findByRouteNumber(String routeNumber);
    List<RouteSheetEn> findByStatus(String status);
    Page<RouteSheetEn> findByStatus(String status, Pageable pageable);
}
