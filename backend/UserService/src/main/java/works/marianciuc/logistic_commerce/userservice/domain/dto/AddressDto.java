package works.marianciuc.logistic_commerce.userservice.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;
import lombok.Value;

/** DTO for {@link works.marianciuc.logistic_commerce.userservice.domain.entity.Address} */
@Value
@Schema(description = "Address")
@JsonIgnoreProperties(ignoreUnknown = true)
public class AddressDto implements Serializable {

  @Schema(description = "Street", example = "Via Roma 123")
  @NotBlank(message = "errors.validation.blank.street")
  String street;

  @Schema(description = "City", example = "Roma")
  @NotBlank(message = "errors.validation.blank.city")
  String city;

  @Schema(description = "State", example = "Lazio")
  String state;

  @Schema(description = "Zip code", example = "00100")
  @NotBlank(message = "errors.validation.blank.zip")
  String zip;

  @Schema(description = "Country", example = "Italy")
  @NotBlank(message = "errors.validation.blank.country")
  String country;
}
