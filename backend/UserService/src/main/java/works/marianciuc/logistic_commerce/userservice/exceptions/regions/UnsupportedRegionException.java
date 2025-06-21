package works.marianciuc.logistic_commerce.userservice.exceptions.regions;

import works.marianciuc.logistic_commerce.userservice.domain.enums.Regions;

public class UnsupportedRegionException extends RuntimeException {
  public UnsupportedRegionException(String region) {
    super("Unsupported region: " + region + "Use one of: " + Regions.getRegions());
  }
}
