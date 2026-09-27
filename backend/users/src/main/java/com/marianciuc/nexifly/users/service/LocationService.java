package com.marianciuc.nexifly.users.service;

import com.marianciuc.nexifly.users.domain.dto.request.CreateLocationRequest;
import com.marianciuc.nexifly.users.domain.dto.response.LocationResponse;

import java.util.List;
import java.util.UUID;

public interface LocationService {

    LocationResponse addLocation(UUID companyId, CreateLocationRequest request);

    List<LocationResponse> getLocations(UUID companyId);

    LocationResponse getDefaultLocation(UUID companyId);
}
