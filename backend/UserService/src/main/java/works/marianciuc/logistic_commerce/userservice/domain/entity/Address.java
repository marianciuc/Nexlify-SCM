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

  @NotBlank(message = "Street cannot be blank")
  @Column(name = "street")
  private String street;

  @NotBlank(message = "City cannot be blank")
  @Column(name = "city")
  private String city;

  @Column(name = "house_number")
  private String houseNumber;

  @Column(name = "street_number")
  private String streetNumber;

  @NotBlank(message = "Zip code cannot be blank")
  @Column(name = "zip")
  private String zip;

  @NotBlank(message = "Country cannot be blank")
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
}
