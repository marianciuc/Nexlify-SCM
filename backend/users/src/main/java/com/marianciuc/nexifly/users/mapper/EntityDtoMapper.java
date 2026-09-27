package com.marianciuc.nexifly.users.mapper;

import com.marianciuc.nexifly.users.domain.dto.response.CompanyResponse;
import com.marianciuc.nexifly.users.domain.dto.response.LocationResponse;
import com.marianciuc.nexifly.users.domain.dto.response.UserResponse;
import com.marianciuc.nexifly.users.repository.entity.CompanyEn;
import com.marianciuc.nexifly.users.repository.entity.CompanyLocationEn;
import com.marianciuc.nexifly.users.repository.entity.UserEn;
import org.springframework.stereotype.Component;

@Component
public class EntityDtoMapper {

    public CompanyResponse toCompanyResponse(CompanyEn entity) {
        if (entity == null) return null;
        return CompanyResponse.builder()
                .id(entity.getId())
                .legalName(entity.getLegalName())
                .tradeName(entity.getTradeName())
                .taxId(entity.getTaxId())
                .registrationCode(entity.getRegistrationCode())
                .organizationType(entity.getOrganizationType())
                .verificationStatus(entity.getVerificationStatus())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .website(entity.getWebsite())
                .rating(entity.getRating())
                .numberOfOrders(entity.getNumberOfOrders())
                .viesValid(entity.isViesValid())
                .paymentsTermsDays(entity.getPaymentsTermsDays())
                .creditLimit(entity.getCreditLimit())
                .creditUsed(entity.getCreditUsed())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public LocationResponse toLocationResponse(CompanyLocationEn entity) {
        if (entity == null) return null;
        return LocationResponse.builder()
                .id(entity.getId())
                .companyId(entity.getCompany() != null ? entity.getCompany().getId() : null)
                .locationName(entity.getLocationName())
                .locationType(entity.getLocationType())
                .street(entity.getStreet())
                .buildingNumber(entity.getBuildingNumber())
                .zip(entity.getZip())
                .city(entity.getCity())
                .country(entity.getCountry())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .isDefault(entity.getIsDefault())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public UserResponse toUserResponse(UserEn entity) {
        if (entity == null) return null;
        return UserResponse.builder()
                .id(entity.getId())
                .companyId(entity.getCompany() != null ? entity.getCompany().getId() : null)
                .keycloakId(entity.getKeycloakId())
                .email(entity.getEmail())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .phoneNumber(entity.getPhoneNumber())
                .accountStatus(entity.getAccountStatus())
                .isEmailVerified(entity.isEmailVerified())
                .dataProcessingConsent(entity.isDataProcessingConsent())
                .timezone(entity.getTimezone())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
