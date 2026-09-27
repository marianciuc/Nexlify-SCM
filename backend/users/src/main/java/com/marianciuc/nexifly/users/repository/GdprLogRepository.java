package com.marianciuc.nexifly.users.repository;

import com.marianciuc.nexifly.users.repository.entity.GdprLogEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GdprLogRepository extends JpaRepository<GdprLogEn, UUID> {

    List<GdprLogEn> findAllByUserId(UUID userId);
}
