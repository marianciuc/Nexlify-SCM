package works.marianciuc.logistic_commerce.userservice.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import java.util.TimeZone;
import org.hibernate.validator.constraints.Length;
import works.marianciuc.logistic_commerce.userservice.domain.enums.CompanyRole;
import works.marianciuc.logistic_commerce.userservice.domain.enums.SystemRole;

@JsonIgnoreProperties(ignoreUnknown = true)
@Schema(description = "Registration Request")
public record RegistrationRequestDTO(
    @Schema(
            description = "System role",
            implementation = SystemRole.class,
            example = "COMPANY_EMPLOYEE")
        @NotNull(message = "System role cannot be null")
        @JsonProperty("system_role")
        SystemRole systemRole,
    @Schema(description = "Company role", implementation = CompanyRole.class, example = "MANAGER")
        @JsonProperty("company_role")
        CompanyRole companyRole,
    @NotNull(message = "Contact number cannot be null")
        @Schema(description = "Contact number", example = "0123456789")
        @Length(min = 10, max = 10, message = "Contact number should be 10 digits long")
        @JsonProperty("contact_number")
        String contactNumber,
    @Schema(description = "User email", example = "<EMAIL>")
        @Email(message = "Email should be valid")
        @NotNull(message = "Email cannot be null")
        String email,
    @Schema(description = "User password", example = "<PASSWORD>")
        @NotNull(message = "Password cannot be null")
        @Length(min = 8, message = "Password should be at least 8 characters long")
        String password,
    @Schema(description = "User first name", example = "John")
        @JsonProperty("first_name")
        @NotNull(message = "First name cannot be null")
        String firstName,
    @Schema(description = "User last name", example = "Doe")
        @JsonProperty("last_name")
        @NotNull(message = "Last name cannot be null")
        String lastName,
    @Schema(description = "User timezone", example = "Europe/Bucharest")
        @JsonProperty("timezone")
        @NotNull(message = "Timezone cannot be null")
        TimeZone timeZone,
    @Schema(description = "User data processing consent", example = "true")
        @JsonProperty("data_processing_consent")
        @NotNull(message = "Data processing consent cannot be null")
        @Length(min = 1, message = "Data processing consent should be accepted")
        Boolean dataProcessingConsent,
    @Schema(description = "User country", example = "Romania")
        @JsonProperty("country")
        @NotNull(message = "Country cannot be null")
        String country,
    @Schema(description = "User company tax id", example = "123456789") @JsonProperty("tax_id")
        String taxId) {}
