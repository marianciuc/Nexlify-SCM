package works.marianciuc.logistic_commerce.userservice.domain.enums;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Arrays;
import java.util.TimeZone;
import lombok.Getter;
import works.marianciuc.logistic_commerce.userservice.exceptions.regions.UnsupportedRegionException;

/**
 * Enum representing different regions with associated time zones, names, and codes.
 *
 * <p>This enum provides predefined constants to represent specific regions, along with their
 * respective TimeZone, name, and ISO country code. Utilities are provided to retrieve regions based
 * on their name or code, and to list all available regions.
 *
 * <p>Constants: - POLAND: Represents the region of Poland with its respective timezone, name, and
 * code. - CHINA: Represents the region of China with its respective timezone, name, and code.
 *
 * <p>Functionalities: - Retrieve all defined regions using the values method. - Retrieve a region
 * by its name using the getRegion method, ensuring a valid region is returned or an
 * UnsupportedRegionException is thrown if the name is invalid. - Retrieve a region by its country
 * code using getRegionByCode, ensuring a valid region is returned or an UnsupportedRegionException
 * is thrown if the code is invalid.
 *
 * <p>Each region is documented with its description and associated properties.
 */
@Getter
@Schema(description = "Region", example = "POLAND")
public enum Regions {
  @Schema(description = "Poland", example = "POLAND")
  POLAND(TimeZone.getTimeZone("Poland"), "Poland", "PL"),
  @Schema(description = "China", example = "CHINA")
  CHINA(TimeZone.getTimeZone("Hongkong"), "China", "CN");

  private final TimeZone timezone;
  private final String name;
  private final String code;

  Regions(TimeZone timezone, String name, String code) {
    this.timezone = timezone;
    this.name = name;
    this.code = code;
  }

  /**
   * Retrieves a region based on its name.
   *
   * <p>This method takes a region name as input and attempts to find the corresponding {@link
   * Regions} enum value. If the input name is null or does not match any defined region, it throws
   * an {@link UnsupportedRegionException}.
   *
   * @param name the name of the region to retrieve
   * @return the region corresponding to the provided name
   * @throws UnsupportedRegionException if the name is null or no matching region is found
   */
  public static Regions getRegion(String name) throws UnsupportedRegionException {
    if (name == null) {
      throw new UnsupportedRegionException("null");
    }
    try {
      return Regions.valueOf(name.toUpperCase());
    } catch (IllegalArgumentException e) {
      throw new UnsupportedRegionException(name);
    }
  }

  /**
   * Retrieves a region by its ISO country code.
   *
   * <p>This method searches through all available regions in the {@code Regions} enum and returns
   * the matching region with the specified ISO country code. If no region matches the given code,
   * or if the provided code is {@code null}, this method throws an {@link
   * UnsupportedRegionException}.
   *
   * @param code the ISO country code of the region to retrieve
   * @return the region corresponding to the provided ISO country code
   * @throws UnsupportedRegionException if the code is invalid or no matching region is found
   */
  public static Regions getRegionByCode(String code) throws UnsupportedRegionException {
    if (code == null) {
      throw new UnsupportedRegionException("NULL");
    }
    return Arrays.stream(values())
        .filter(r -> r.getCode().equals(code.toUpperCase()))
        .findFirst()
        .orElseThrow(() -> new UnsupportedRegionException(code));
  }
}
