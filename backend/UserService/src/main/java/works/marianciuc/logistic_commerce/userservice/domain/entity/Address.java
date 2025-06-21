
package works.marianciuc.logistic_commerce.userservice.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import java.util.Objects;
import lombok.*;

@Embeddable
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Address {

  private static final String VALIDATION_STREET_BLANK = "{errors.validation.blank.street}";
  private static final String VALIDATION_CITY_BLANK = "{errors.validation.blank.city}";
  private static final String VALIDATION_ZIP_BLANK = "{errors.validation.blank.zip}";
  private static final String VALIDATION_COUNTRY_BLANK = "{errors.validation.blank.country}";

  @NotBlank(message = VALIDATION_STREET_BLANK)
  @Column(name = "street")
  private String street;

  @NotBlank(message = VALIDATION_CITY_BLANK)
  @Column(name = "city")
  private String city;

  @Column(name = "house_number")
  private String houseNumber;

  @Column(name = "street_number")
  private String streetNumber;

  @NotBlank(message = VALIDATION_ZIP_BLANK)
  @Column(name = "zip")
  private String zip;

  @NotBlank(message = VALIDATION_COUNTRY_BLANK)
  @Column(name = "country")
  private String country;

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Address address)) return false;
    return Objects.equals(street, address.street)
        && Objects.equals(city, address.city)
        && Objects.equals(zip, address.zip)
        && Objects.equals(country, address.country);
  }

  @Override
  public int hashCode() {
    return Objects.hash(street, city, zip, country);
  }

  @Override
  public String toString() {
    return String.format(
        "Address{street='%s', city='%s',  zip='%s', country='%s'}", street, city, zip, country);
  }

  public String getFullAddress() {
    return formatStreetAddress() + ", " + nullSafe(city);
  }

  public String getFullAddressWithCountry() {
    return formatStreetAddress() + ", " + nullSafe(city) + ", " + nullSafe(country);
  }

  private String formatStreetAddress() {
    StringBuilder streetAddress = new StringBuilder(nullSafe(street));

    if (houseNumber != null && !houseNumber.trim().isEmpty()) {
      streetAddress.append(", ").append(houseNumber);
    }

    if (streetNumber != null && !streetNumber.trim().isEmpty()) {
      streetAddress.append(" ").append(streetNumber);
    }

    return streetAddress.toString();
  }

  private String nullSafe(String value) {
    return value != null ? value : "";
  }
}
