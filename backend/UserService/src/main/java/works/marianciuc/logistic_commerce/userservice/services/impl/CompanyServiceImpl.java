package works.marianciuc.logistic_commerce.userservice.services.impl;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import works.marianciuc.logistic_commerce.userservice.domain.dto.requests.CreateCompanyRequest;
import works.marianciuc.logistic_commerce.userservice.domain.model.Company;
import works.marianciuc.logistic_commerce.userservice.domain.qfilters.CompanySearchFilter;
import works.marianciuc.logistic_commerce.userservice.exceptions.company.CompanyAlreadyExistsException;
import works.marianciuc.logistic_commerce.userservice.exceptions.company.CompanyNotFoundException;
import works.marianciuc.logistic_commerce.userservice.mappers.AddressMapper;
import works.marianciuc.logistic_commerce.userservice.mappers.CompanyMapper;
import works.marianciuc.logistic_commerce.userservice.repositories.CompanyRepository;
import works.marianciuc.logistic_commerce.userservice.repositories.entity.CompanyEn;
import works.marianciuc.logistic_commerce.userservice.services.CompanyService;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

  private final CompanyRepository companyRepository;
  private final CompanyMapper companyMapper;
  private final AddressMapper addressMapper;

  @Override
  @Transactional
  public Company createCompany(CreateCompanyRequest request) throws CompanyAlreadyExistsException {
    log.debug("Creating company with name: {}", request.getName());

    // Check if company with the same tax ID already exists
    Optional<CompanyEn> existingCompany =
        companyRepository.findAll().stream()
            .filter(company -> company.getTaxId().equals(request.getTaxId()))
            .findFirst();

    if (existingCompany.isPresent()) {
      log.error("Company with tax ID {} already exists", request.getTaxId());
      throw new CompanyAlreadyExistsException(
          "Company with tax ID " + request.getTaxId() + " already exists");
    }

    CompanyEn companyEn =
        CompanyEn.builder()
            .name(request.getName())
            .taxId(request.getTaxId())
            .email(request.getEmail())
            .address(addressMapper.toEntity(request.getAddress()))
            .build();

    CompanyEn savedCompany = companyRepository.save(companyEn);
    log.info("Company created with ID: {}", savedCompany.getId());

    return companyMapper.toDto(savedCompany);
  }

  @Override
  @Transactional
  public void verifyCompany(UUID id) {
    log.debug("Verifying company with ID: {}", id);
    CompanyEn company = getCompanyEntityById(id);
    company.verify();
    companyRepository.save(company);
    log.info("Company with ID: {} verified", id);
  }

  @Override
  @Transactional
  public void rejectCompany(UUID id) {
    log.debug("Rejecting company with ID: {}", id);
    CompanyEn company = getCompanyEntityById(id);
    company.reject();
    companyRepository.save(company);
    log.info("Company with ID: {} rejected", id);
  }

  @Override
  @Transactional
  public void blockCompany(UUID id) {
    log.debug("Blocking company with ID: {}", id);
    CompanyEn company = getCompanyEntityById(id);
    company.delete();
    companyRepository.save(company);
    log.info("Company with ID: {} blocked", id);
  }

  @Override
  @Transactional
  public void unblockCompany(UUID id) {
    log.debug("Unblocking company with ID: {}", id);
    CompanyEn company = getCompanyEntityById(id);
    company.restore();
    companyRepository.save(company);
    log.info("Company with ID: {} unblocked", id);
  }

  @Override
  @Transactional(readOnly = true)
  public Company getCompanyById(UUID id) {
    log.debug("Getting company with ID: {}", id);
    CompanyEn company = getCompanyEntityById(id);
    return companyMapper.toDto(company);
  }

  @Override
  @Transactional(readOnly = true)
  public Company getCompanyByTaxId(String taxId) {
    log.debug("Getting company with tax ID: {}", taxId);
    CompanyEn company =
        companyRepository.findAll().stream()
            .filter(c -> c.getTaxId().equals(taxId))
            .findFirst()
            .orElseThrow(
                () -> {
                  log.error("Company with tax ID {} not found", taxId);
                  return new CompanyNotFoundException(
                      "Company with tax ID " + taxId + " not found");
                });

    return companyMapper.toDto(company);
  }

  @Override
  @Transactional(readOnly = true)
  public List<Company> findAllCompanies(CompanySearchFilter filter) {
    return null;
  }

  /**
   * Helper method to get a company entity by ID.
   *
   * @param id the company ID
   * @return the company entity
   * @throws CompanyNotFoundException if the company is not found
   */
  private CompanyEn getCompanyEntityById(UUID id) {
    return companyRepository
        .findById(id)
        .orElseThrow(
            () -> {
              log.error("Company with ID {} not found", id);
              return new CompanyNotFoundException("Company with ID " + id + " not found");
            });
  }
}
