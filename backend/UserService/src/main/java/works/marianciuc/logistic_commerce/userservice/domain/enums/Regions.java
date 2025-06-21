package works.marianciuc.logistic_commerce.userservice.domain.enums;

import java.util.List;
import java.util.TimeZone;
import lombok.Getter;
import works.marianciuc.logistic_commerce.userservice.exceptions.regions.UnsupportedRegionException;

@Getter
public enum Regions {
  POLAND(TimeZone.getTimeZone("Poland"), "Poland", "PL"),
  CHINA(TimeZone.getTimeZone("Hongkong"), "China", "CN");

  private final TimeZone timezone;
  private final String name;
  private final String code;

  Regions(TimeZone timezone, String name, String code) {
    this.timezone = timezone;
    this.name = name;
    this.code = code;
  }

  public static List<Regions> getRegions() {
    return List.of(POLAND, CHINA);
  }

  public static Regions getRegion(String name) throws UnsupportedRegionException {
    try {
      return Regions.valueOf(name.toUpperCase());
    } catch (IllegalArgumentException e) {
      throw new UnsupportedRegionException(name);
    }
  }

  public static Regions getRegionByCode(String code) throws UnsupportedRegionException {
    return getRegions().stream()
        .filter(r -> r.getCode().equals(code.toUpperCase()))
        .findFirst()
        .orElseThrow(() -> new UnsupportedRegionException(code));
  }
}
