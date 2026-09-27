package com.marianciuc.nexifly.users.service.impl;

import com.marianciuc.nexifly.users.domain.dto.request.CreateEmployeeRequest;
import com.marianciuc.nexifly.users.domain.dto.response.UserResponse;
import com.marianciuc.nexifly.users.domain.enums.AccountStatus;
import com.marianciuc.nexifly.users.exception.CompanyNotFoundException;
import com.marianciuc.nexifly.users.exception.EmailAlreadyExistsException;
import com.marianciuc.nexifly.users.exception.UserNotFoundException;
import com.marianciuc.nexifly.users.mapper.EntityDtoMapper;
import com.marianciuc.nexifly.users.repository.CompanyRepository;
import com.marianciuc.nexifly.users.repository.UserRepository;
import com.marianciuc.nexifly.users.repository.entity.CompanyEn;
import com.marianciuc.nexifly.users.repository.entity.UserEn;
import com.marianciuc.nexifly.users.service.EmployerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployerServiceImpl implements EmployerService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final EntityDtoMapper mapper;

    @Override
    @Transactional
    public UserResponse addEmployee(UUID companyId, CreateEmployeeRequest request) {
        log.info("Adding employee {} to company {}", request.getEmail(), companyId);

        CompanyEn company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CompanyNotFoundException(companyId));

        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException(email);
        }

        UserEn user = UserEn.builder()
                .company(company)
                .keycloakId(request.getKeycloakId() != null ? request.getKeycloakId() : UUID.randomUUID().toString())
                .email(email)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .accountStatus(AccountStatus.ACTIVE)
                .isEmailVerified(false)
                .dataProcessingConsent(request.isDataProcessingConsent())
                .timezone(request.getTimezone() != null ? request.getTimezone() : "Europe/Warsaw")
                .build();

        UserEn saved = userRepository.save(user);
        log.info("Employee created with id={} for company={}", saved.getId(), companyId);
        return mapper.toUserResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getEmployees(UUID companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new CompanyNotFoundException(companyId);
        }
        return userRepository.findAllByCompanyIdAndIsDeletedFalse(companyId)
                .stream()
                .map(mapper::toUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponse updateEmployeeStatus(UUID companyId, UUID employeeId, AccountStatus status) {
        if (!companyRepository.existsById(companyId)) {
            throw new CompanyNotFoundException(companyId);
        }
        UserEn user = userRepository.findById(employeeId)
                .orElseThrow(() -> new UserNotFoundException(employeeId));

        if (user.getCompany() == null || !user.getCompany().getId().equals(companyId)) {
            throw new IllegalArgumentException("Employee does not belong to specified company");
        }

        user.setAccountStatus(status);
        UserEn saved = userRepository.save(user);
        return mapper.toUserResponse(saved);
    }
}
