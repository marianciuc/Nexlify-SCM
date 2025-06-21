package works.marianciuc.logistic_commerce.userservice.repositories;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import works.marianciuc.logistic_commerce.userservice.domain.entity.Company;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {}
