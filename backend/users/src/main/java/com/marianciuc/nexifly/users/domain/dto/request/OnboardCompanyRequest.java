package com.marianciuc.nexifly.users.domain.dto.request;

import com.marianciuc.nexifly.users.domain.enums.OrganizationType;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnboardCompanyRequest {

    @NotBlank(message = "Legal name cannot be blank")
    private String legalName;

    private String tradeName;

    @NotBlank(message = "Tax ID (NIP / VAT) is required")
    private String taxId;

    private String registrationCode;

    @NotNull(message = "Organization type is required")
    private OrganizationType organizationType;

    @NotBlank(message = "Company email is required")
    @Email(message = "Invalid company email format")
    private String companyEmail;

    private String phone;
    private String website;

    // First Company Admin User details
    @NotBlank(message = "Admin first name is required")
    private String adminFirstName;

    @NotBlank(message = "Admin last name is required")
    private String adminLastName;

    @NotBlank(message = "Admin email is required")
    @Email(message = "Invalid admin email format")
    private String adminEmail;

    private String adminPhoneNumber;

    @AssertTrue(message = "GDPR data processing consent is required")
    private boolean dataProcessingConsent;

    // Primary Legal Location details
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
}
