package works.marianciuc.logistic_commerce.userservice.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Value;
import works.marianciuc.logistic_commerce.userservice.domain.enums.CompanyVerificationStatus;

@Value
@JsonIgnoreProperties(ignoreUnknown = true)
@Schema(description = "Company list object")
public class CompanyListObject {
  @Schema(description = "Company name", example = "Example Company sp. zoo")
  String name;

  @Schema(description = "Company address", example = "Roma, Via Roma 123")
  String address;

  @Schema(description = "Country", example = "Italy")
  String country;

  @Schema(description = "Company registration number", example = "123456789")
  @JsonProperty("tax_id")
  String taxId;

  @Schema(description = "Company email", example = "example@mail.com")
  String email;

  @Schema(description = "Company rating", example = "4.5")
  String rating;

  @Schema(
      description = "Company verification status",
      example = "VERIFIED",
      implementation = CompanyVerificationStatus.class)
  @JsonProperty("verification_status")
  String verificationStatus;
}
