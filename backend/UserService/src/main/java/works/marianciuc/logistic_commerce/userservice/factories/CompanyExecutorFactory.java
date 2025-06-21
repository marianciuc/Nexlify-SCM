package works.marianciuc.logistic_commerce.userservice.factories;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import works.marianciuc.logistic_commerce.userservice.domain.dto.CompanyDto;
import works.marianciuc.logistic_commerce.userservice.mappers.CompanyMapper;
import works.marianciuc.logistic_commerce.userservice.services.CompanyExecutorService;

@Slf4j
@RequiredArgsConstructor
@Service
public class CompanyExecutorFactory {

  private final List<CompanyExecutorService> executors;
  private final CompanyMapper companyMapper;

  public CompanyDto executeByCountry(String countryCode, String taxId) {
    log.info("Executing company executor for country: {}", countryCode);
    CompanyExecutorService executor =
        executors.stream()
            .filter(e -> e.supports(countryCode))
            .findFirst()
            .orElseThrow(
                () ->
                    new IllegalArgumentException("No executor found for country: " + countryCode));

    log.info(
        "Using executor: {} for country: {}", executor.getClass().getSimpleName(), countryCode);
    return companyMapper.toDto(executor.execute(taxId));
  }
}
