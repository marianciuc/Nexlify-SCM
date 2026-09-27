package com.marianciuc.nexifly.users.controller.impl;

import com.marianciuc.nexifly.users.controller.EmployersController;
import com.marianciuc.nexifly.users.domain.dto.request.CreateEmployeeRequest;
import com.marianciuc.nexifly.users.domain.dto.request.UpdateUserStatusRequest;
import com.marianciuc.nexifly.users.domain.dto.response.UserResponse;
import com.marianciuc.nexifly.users.service.EmployerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class EmployersControllerImpl implements EmployersController {

    private final EmployerService employerService;

    @Override
    public ResponseEntity<List<UserResponse>> getEmployees(UUID companyId) {
        return ResponseEntity.ok(employerService.getEmployees(companyId));
    }

    @Override
    public ResponseEntity<UserResponse> addEmployee(UUID companyId, CreateEmployeeRequest request) {
        UserResponse response = employerService.addEmployee(companyId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    public ResponseEntity<UserResponse> updateEmployeeStatus(UUID companyId, UUID employeeId, UpdateUserStatusRequest request) {
        return ResponseEntity.ok(employerService.updateEmployeeStatus(companyId, employeeId, request.getStatus()));
    }
}
