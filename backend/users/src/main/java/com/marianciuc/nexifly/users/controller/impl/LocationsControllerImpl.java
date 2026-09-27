package com.marianciuc.nexifly.users.controller.impl;

import com.marianciuc.nexifly.users.controller.LocationsController;
import com.marianciuc.nexifly.users.domain.dto.request.CreateLocationRequest;
import com.marianciuc.nexifly.users.domain.dto.response.LocationResponse;
import com.marianciuc.nexifly.users.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class LocationsControllerImpl implements LocationsController {

    private final LocationService locationService;

    @Override
    public ResponseEntity<List<LocationResponse>> getLocations(UUID companyId) {
        return ResponseEntity.ok(locationService.getLocations(companyId));
    }

    @Override
    public ResponseEntity<LocationResponse> addLocation(UUID companyId, CreateLocationRequest request) {
        LocationResponse response = locationService.addLocation(companyId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
