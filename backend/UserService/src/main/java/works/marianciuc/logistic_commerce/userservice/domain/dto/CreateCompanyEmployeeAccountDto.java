package works.marianciuc.logistic_commerce.userservice.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.Length;
import works.marianciuc.logistic_commerce.userservice.domain.enums.CompanyRole;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CreateCompanyEmployeeAccountDto(
    @NotNull(message = "Email is required") @Email(message = "Email must be valid") String email,
    @NotNull(message = "Password is required")
        @Length(min = 8, message = "Password must be at least 8 characters long")
        String password,
    @NotNull(message = "Company role is required") CompanyRole companyRole,
    @NotNull(message = "First name is required") String firstName,
    @NotNull(message = "Last name is required") String lastName,
    String country,
    @NotNull(message = "Contact number is required") String contactNumber) {}
