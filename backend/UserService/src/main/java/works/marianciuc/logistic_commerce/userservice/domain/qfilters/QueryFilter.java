package works.marianciuc.logistic_commerce.userservice.domain.qfilters;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.query.SortDirection;

/** Abstract base class for query filters providing common pagination and sorting functionality. */
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@Schema(description = "Query filter")
public abstract class QueryFilter {

  @Schema(description = "Query string", example = "John")
  @JsonProperty(value = "query")
  private String query;

  @Schema(
      description = "Sort direction",
      example = "asc",
      defaultValue = "asc",
      allowableValues = {"asc", "desc"})
  @JsonProperty(value = "sort")
  private String sortDirection = "asc";

  @Schema(description = "Sort field", example = "name")
  @JsonProperty(value = "sort_by")
  private String sortBy;

  @Schema(
      description = "Page number",
      example = "1",
      requiredMode = Schema.RequiredMode.NOT_REQUIRED,
      defaultValue = "1")
  @JsonProperty(value = "page")
  private Integer page = 1;

  @Schema(
      description = "Page size",
      example = "10",
      requiredMode = Schema.RequiredMode.NOT_REQUIRED,
      defaultValue = "10")
  private Integer size = 10;

  /**
   * Converts a string sort direction to {@link SortDirection} enum
   *
   * @return {@link SortDirection#ASCENDING} by default if conversion fails
   */
  public SortDirection getSortDirection() {
    try {
      return SortDirection.interpret(this.sortDirection);
    } catch (IllegalArgumentException e) {
      return SortDirection.ASCENDING;
    }
  }

  /**
   * Retrieves the field by which the data will be sorted. If no sort field is provided or it is
   * blank, "id" is used as the default.
   *
   * @return the sort field to be used, defaults to "id" if unspecified or blank.
   */
  public String getSortBy() {
    return (sortBy == null || sortBy.isBlank()) ? "id" : sortBy;
  }

  public Integer getPage() {
    return (page == null || page < 1) ? 0 : page - 1;
  }
}
