package com.marianciuc.nexifly.users.domain.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationResponse {

    private UUID id;
    private UUID companyId;
    private String locationName;
    private String locationType;
    private String street;
    private String buildingNumber;
    private String zip;
    private String city;
    private String country;
    private Double latitude;
    private Double longitude;
    private Boolean isDefault;
    private Instant createdAt;
}
