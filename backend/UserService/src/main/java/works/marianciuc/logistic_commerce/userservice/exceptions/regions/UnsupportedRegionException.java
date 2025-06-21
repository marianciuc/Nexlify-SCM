package works.marianciuc.logistic_commerce.userservice.exceptions.regions;

import works.marianciuc.logistic_commerce.userservice.exceptions.general.UnsupportedOperationException;

public class UnsupportedRegionException extends UnsupportedOperationException {

  private static final String MESSAGE = "errors.region.unsupported";
  private static final String DOMAIN = "REGION";

  public UnsupportedRegionException(String region) {
    super(MESSAGE, DOMAIN, region);
  }
}
