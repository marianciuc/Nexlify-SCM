package works.marianciuc.logistic_commerce.userservice.repositories;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import works.marianciuc.logistic_commerce.userservice.repositories.entity.UserEn;

@Repository
public interface UserRepository extends JpaRepository<UserEn, UUID> {}
