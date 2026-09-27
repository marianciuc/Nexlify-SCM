package com.marianciuc.nexifly.users.service.impl;

import com.marianciuc.nexifly.users.domain.dto.request.OnboardCompanyRequest;
import com.marianciuc.nexifly.users.domain.dto.response.OnboardCompanyResponse;
import com.marianciuc.nexifly.users.domain.enums.AccountStatus;
import com.marianciuc.nexifly.users.domain.enums.VerificationStatus;
import com.marianciuc.nexifly.users.exception.EmailAlreadyExistsException;
import com.marianciuc.nexifly.users.exception.TaxIdAlreadyExistsException;
import com.marianciuc.nexifly.users.mapper.EntityDtoMapper;
import com.marianciuc.nexifly.users.repository.CompanyLocationRepository;
import com.marianciuc.nexifly.users.repository.CompanyRepository;
import com.marianciuc.nexifly.users.repository.UserRepository;
import com.marianciuc.nexifly.users.repository.entity.CompanyEn;
import com.marianciuc.nexifly.users.repository.entity.CompanyLocationEn;
import com.marianciuc.nexifly.users.repository.entity.UserEn;
import com.marianciuc.nexifly.users.service.CompanyCreatingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyCreatingServiceImpl implements CompanyCreatingService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final CompanyLocationRepository companyLocationRepository;
    private final EntityDtoMapper mapper;

    @Override
    @Transactional
    public OnboardCompanyResponse onboardCompany(OnboardCompanyRequest request) {
        log.info("Starting onboarding for company: legalName={}, taxId={}", request.getLegalName(), request.getTaxId());

        String normalizedTaxId = normalizeTaxId(request.getTaxId());

        if (companyRepository.existsByTaxId(normalizedTaxId)) {
            throw new TaxIdAlreadyExistsException(normalizedTaxId);
        }

        if (companyRepository.existsByEmail(request.getCompanyEmail())) {
            throw new EmailAlreadyExistsException(request.getCompanyEmail());
        }

        if (userRepository.existsByEmail(request.getAdminEmail())) {
            throw new EmailAlreadyExistsException(request.getAdminEmail());
        }

        boolean isTaxValid = validateTaxId(normalizedTaxId);

        // 1. Create Company Entity
        CompanyEn company = CompanyEn.builder()
                .legalName(request.getLegalName())
                .tradeName(request.getTradeName() != null ? request.getTradeName() : request.getLegalName())
                .taxId(normalizedTaxId)
                .registrationCode(request.getRegistrationCode())
                .organizationType(request.getOrganizationType())
                .verificationStatus(VerificationStatus.PENDING)
                .email(request.getCompanyEmail().toLowerCase().trim())
                .phone(request.getPhone())
                .website(request.getWebsite())
                .viesValid(isTaxValid)
                .paymentsTermsDays(0)
                .creditLimit(BigDecimal.ZERO)
                .creditUsed(BigDecimal.ZERO)
                .rating(BigDecimal.ZERO)
                .build();

        CompanyEn savedCompany = companyRepository.save(company);

        // 2. Create Primary Legal Location
        CompanyLocationEn legalLocation = CompanyLocationEn.builder()
                .company(savedCompany)
                .locationName("Primary Legal Address")
                .locationType("LEGAL")
                .street(request.getStreet())
                .buildingNumber(request.getBuildingNumber())
                .zip(request.getZip())
                .city(request.getCity())
                .country(request.getCountry() != null ? request.getCountry().toUpperCase() : "PL")
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isDefault(true)
                .build();

        CompanyLocationEn savedLocation = companyLocationRepository.save(legalLocation);

        // 3. Create First Administrator User
        UserEn adminUser = UserEn.builder()
                .company(savedCompany)
                .keycloakId(UUID.randomUUID().toString()) // Can be linked/updated via Keycloak SSO callback
                .email(request.getAdminEmail().toLowerCase().trim())
                .firstName(request.getAdminFirstName())
                .lastName(request.getAdminLastName())
                .phoneNumber(request.getAdminPhoneNumber())
                .accountStatus(AccountStatus.ACTIVE)
                .isEmailVerified(false)
                .dataProcessingConsent(request.isDataProcessingConsent())
                .timezone("Europe/Warsaw")
                .build();

        UserEn savedAdminUser = userRepository.save(adminUser);

        log.info("Successfully onboarded company with id={}, adminUserId={}, locationId={}",
                savedCompany.getId(), savedAdminUser.getId(), savedLocation.getId());

        return OnboardCompanyResponse.builder()
                .company(mapper.toCompanyResponse(savedCompany))
                .adminUser(mapper.toUserResponse(savedAdminUser))
                .legalLocation(mapper.toLocationResponse(savedLocation))
                .build();
    }

    @Override
    public boolean validateTaxId(String taxId) {
        if (taxId == null) return false;
        String clean = normalizeTaxId(taxId);

        // Remove PL prefix if present
        if (clean.startsWith("PL")) {
            clean = clean.substring(2);
        }

        // Polish NIP validation (10 digits)
        if (clean.matches("\\d{10}")) {
            int[] weights = {6, 5, 7, 2, 3, 4, 5, 6, 7};
            int sum = 0;
            for (int i = 0; i < 9; i++) {
                sum += Character.getNumericValue(clean.charAt(i)) * weights[i];
            }
            int checksum = sum % 11;
            int controlDigit = Character.getNumericValue(clean.charAt(9));
            return checksum == controlDigit;
        }

        // EU VAT generic check (at least 8 alphanumeric characters)
        return clean.matches("^[A-Z0-9]{8,14}$");
    }

    private String normalizeTaxId(String taxId) {
        return taxId.trim().toUpperCase().replaceAll("[\\s-]", "");
    }
}
