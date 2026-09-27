package com.marianciuc.nexifly.users.repository;

import com.marianciuc.nexifly.users.repository.entity.UserEn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<UserEn, UUID> {

    Optional<UserEn> findByEmail(String email);

    Optional<UserEn> findByKeycloakId(String keycloakId);

    boolean existsByEmail(String email);

    List<UserEn> findAllByCompanyId(UUID companyId);

    List<UserEn> findAllByCompanyIdAndIsDeletedFalse(UUID companyId);
}
