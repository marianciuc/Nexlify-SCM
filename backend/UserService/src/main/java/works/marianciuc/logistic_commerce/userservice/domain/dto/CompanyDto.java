package works.marianciuc.logistic_commerce.userservice.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Value;
import works.marianciuc.logistic_commerce.userservice.domain.enums.CompanyVerificationStatus;

/** DTO for {@link works.marianciuc.logistic_commerce.userservice.domain.entity.Company} */
@Value
@JsonIgnoreProperties(ignoreUnknown = true)
@Schema(description = "Company")
public class CompanyDto implements Serializable {
  @Schema(description = "Company id", example = "123e4567-e89b-12d3-a456-426655440000")
  UUID id;

  @Schema(description = "Company creation date", example = "2024-01-15T10:30:00")
  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
  @JsonProperty("created_at")
  LocalDateTime createdAt;

  @Schema(description = "Company last updating date", example = "2024-01-15T10:30:00")
  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
  @JsonProperty("updated_at")
  LocalDateTime updatedAt;

  @Schema(description = "Company deletion date", example = "2024-01-15T10:30:00")
  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
  @JsonProperty("deleted_at")
  LocalDateTime deletedAt;

  @Schema(description = "Is company deleted", example = "false")
  @JsonProperty("is_deleted")
  Boolean isDeleted;

  @Schema(description = "Company legal name", example = "Example Company sp. zoo")
  String name;

  @Schema(description = "Company registration number", example = "123456789")
  @JsonProperty("tax_id")
  String taxId;

  @Schema(description = "Company email", example = "example@gmail.com")
  String email;

  @Schema(
      description = "Company verification status",
      example = "VERIFIED",
      implementation = CompanyVerificationStatus.class)
  @JsonProperty("verification_status")
  CompanyVerificationStatus verificationStatus;

  @Schema(description = "Company rating", example = "4.5")
  Double rating;

  @Schema(description = "Company address", required = true, implementation = AddressDto.class)
  AddressDto address;

  @Schema(description = "Number of closed orders", example = "10")
  @JsonProperty("number_of_orders")
  Long numberOfOrders;

  @Schema(description = "Number of rated users", example = "100")
  @JsonProperty("number_of_ratings")
  Long numberOfRatings;
}
