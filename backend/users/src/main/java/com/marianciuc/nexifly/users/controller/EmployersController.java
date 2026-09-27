package com.marianciuc.nexifly.users.controller;

import com.marianciuc.nexifly.users.domain.dto.request.CreateEmployeeRequest;
import com.marianciuc.nexifly.users.domain.dto.request.UpdateUserStatusRequest;
import com.marianciuc.nexifly.users.domain.dto.response.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequestMapping("/api/v1/companies/{companyId}/employees")
public interface EmployersController {

    @GetMapping
    ResponseEntity<List<UserResponse>> getEmployees(@PathVariable UUID companyId);

    @PostMapping
    ResponseEntity<UserResponse> addEmployee(@PathVariable UUID companyId, @Valid @RequestBody CreateEmployeeRequest request);

    @PatchMapping("/{employeeId}/status")
    ResponseEntity<UserResponse> updateEmployeeStatus(
            @PathVariable UUID companyId,
            @PathVariable UUID employeeId,
            @Valid @RequestBody UpdateUserStatusRequest request);
}
