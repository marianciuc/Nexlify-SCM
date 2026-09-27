package com.marianciuc.nexifly.users.repository;

import com.marianciuc.nexifly.users.repository.entity.AuthentificationLogEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuthentificationLogRepository extends JpaRepository<AuthentificationLogEn, UUID> {

    List<AuthentificationLogEn> findAllByUserId(UUID userId);
}
