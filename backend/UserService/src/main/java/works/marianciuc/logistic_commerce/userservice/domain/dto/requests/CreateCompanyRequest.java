package works.marianciuc.logistic_commerce.userservice.domain.dto.requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Value;
import works.marianciuc.logistic_commerce.userservice.domain.model.Address;

@Value
@JsonIgnoreProperties(ignoreUnknown = true)
@Schema(description = "Request to create a new company")
public class CreateCompanyRequest {
  @Schema(description = "Company legal name", example = "Example Company sp. zoo", required = true)
  @NotBlank(message = "Company name is required")
  String name;

  @Schema(
      description = "Company registration number (tax ID)",
      example = "123456789",
      required = true)
  @NotBlank(message = "Tax ID is required")
  @JsonProperty("tax_id")
  String taxId;

  @Schema(description = "Company email", example = "company@example.com", required = true)
  @NotBlank(message = "Email is required")
  @Email(message = "Email must be valid")
  String email;

  @Schema(description = "Company address", required = true)
  @NotNull(message = "Address is required")
  @Valid
  Address address;
}
