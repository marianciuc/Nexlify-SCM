package com.marianciuc.nexifly.users.controller;

import com.marianciuc.nexifly.users.domain.dto.request.CreateLocationRequest;
import com.marianciuc.nexifly.users.domain.dto.response.LocationResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequestMapping("/api/v1/companies/{companyId}/locations")
public interface LocationsController {

    @GetMapping
    ResponseEntity<List<LocationResponse>> getLocations(@PathVariable UUID companyId);

    @PostMapping
    ResponseEntity<LocationResponse> addLocation(@PathVariable UUID companyId, @Valid @RequestBody CreateLocationRequest request);
}
