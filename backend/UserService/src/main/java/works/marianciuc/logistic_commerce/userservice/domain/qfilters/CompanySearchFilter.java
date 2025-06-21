package works.marianciuc.logistic_commerce.userservice.domain.qfilters;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;

@Schema(description = "Search parameters for companies")
public class CompanySearchFilter extends QueryFilter {
  @Schema(
      description = "Company tax id",
      example = "123456789",
      requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("tax_id")
  private String taxId;

  @Schema(
      description = "Company name",
      example = "Example Company sp. zoo",
      requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  private String name;

  @Schema(
      description = "Company country",
      example = "Italy",
      requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  private String country;

  @Schema(
      description = "Company city",
      example = "Roma",
      requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("city")
  private String city;

  @Schema(
      description = "Company id",
      example = "123e4567-e89b-12d3-a456-426655440000",
      requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  private UUID id;

  @Schema(
      description = "Company verification status",
      example = "true",
      requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  private Boolean verified;

  @Schema(
      description = "Only system companies",
      example = "true",
      requiredMode = Schema.RequiredMode.NOT_REQUIRED)
  @JsonProperty("only_system_companies")
  private Boolean onlySystemCompanies;
}
