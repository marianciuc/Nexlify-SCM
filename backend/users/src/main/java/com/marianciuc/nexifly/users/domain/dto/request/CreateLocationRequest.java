package com.marianciuc.nexifly.users.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateLocationRequest {

    @NotBlank(message = "Location name is required")
    private String locationName;

    @NotBlank(message = "Location type is required (e.g., LEGAL, WAREHOUSE, DELIVERY_POINT)")
    private String locationType;

    @NotBlank(message = "Street is required")
    private String street;

    @NotBlank(message = "Building number is required")
    private String buildingNumber;

    @NotBlank(message = "Postal code (zip) is required")
    private String zip;

    @NotBlank(message = "City is required")
    private String city;

    @Builder.Default
    private String country = "PL";

    private Double latitude;
    private Double longitude;

    @Builder.Default
    private Boolean isDefault = false;
}
