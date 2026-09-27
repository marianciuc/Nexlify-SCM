package com.marianciuc.nexifly.users.service.impl;

import com.marianciuc.nexifly.users.domain.dto.request.CreateLocationRequest;
import com.marianciuc.nexifly.users.domain.dto.response.LocationResponse;
import com.marianciuc.nexifly.users.exception.CompanyNotFoundException;
import com.marianciuc.nexifly.users.mapper.EntityDtoMapper;
import com.marianciuc.nexifly.users.repository.CompanyLocationRepository;
import com.marianciuc.nexifly.users.repository.CompanyRepository;
import com.marianciuc.nexifly.users.repository.entity.CompanyEn;
import com.marianciuc.nexifly.users.repository.entity.CompanyLocationEn;
import com.marianciuc.nexifly.users.service.LocationService;
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
public class LocationServiceImpl implements LocationService {

    private final CompanyRepository companyRepository;
    private final CompanyLocationRepository locationRepository;
    private final EntityDtoMapper mapper;

    @Override
    @Transactional
    public LocationResponse addLocation(UUID companyId, CreateLocationRequest request) {
        CompanyEn company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CompanyNotFoundException(companyId));

        CompanyLocationEn location = CompanyLocationEn.builder()
                .company(company)
                .locationName(request.getLocationName())
                .locationType(request.getLocationType().toUpperCase())
                .street(request.getStreet())
                .buildingNumber(request.getBuildingNumber())
                .zip(request.getZip())
                .city(request.getCity())
                .country(request.getCountry() != null ? request.getCountry().toUpperCase() : "PL")
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isDefault(Boolean.TRUE.equals(request.getIsDefault()))
                .build();

        CompanyLocationEn saved = locationRepository.save(location);
        return mapper.toLocationResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationResponse> getLocations(UUID companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new CompanyNotFoundException(companyId);
        }
        return locationRepository.findAllByCompanyId(companyId)
                .stream()
                .map(mapper::toLocationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LocationResponse getDefaultLocation(UUID companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new CompanyNotFoundException(companyId);
        }
        return locationRepository.findByCompanyIdAndIsDefaultTrue(companyId)
                .map(mapper::toLocationResponse)
                .orElse(null);
    }
}
