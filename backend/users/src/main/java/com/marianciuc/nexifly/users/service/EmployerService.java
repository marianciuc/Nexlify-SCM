package com.marianciuc.nexifly.users.service;

import com.marianciuc.nexifly.users.domain.dto.request.CreateEmployeeRequest;
import com.marianciuc.nexifly.users.domain.dto.response.UserResponse;
import com.marianciuc.nexifly.users.domain.enums.AccountStatus;

import java.util.List;
import java.util.UUID;

public interface EmployerService {

    UserResponse addEmployee(UUID companyId, CreateEmployeeRequest request);

    List<UserResponse> getEmployees(UUID companyId);

    UserResponse updateEmployeeStatus(UUID companyId, UUID employeeId, AccountStatus status);
}
