package works.marianciuc.logistic_commerce.userservice.exceptions.integrations;

import org.springframework.http.HttpStatus;
import works.marianciuc.logistic_commerce.userservice.exceptions.general.BusinessException;

/** Exception thrown when IP geolocation service is unavailable or fails. */
public class IpGeoLocationServiceException extends BusinessException {

  private static final String MESSAGE_KEY = "errors.integration.ip_geolocation.service_unavailable";
  private static final String ERROR_CODE = "IP_GEOLOCATION_SERVICE_ERROR";

  public IpGeoLocationServiceException(String ipAddress) {
    super(MESSAGE_KEY, HttpStatus.SERVICE_UNAVAILABLE, ERROR_CODE, ipAddress);
  }

  public IpGeoLocationServiceException(String ipAddress, String reason) {
    super(
        "errors.integration.ip_geolocation.service_error",
        HttpStatus.SERVICE_UNAVAILABLE,
        ERROR_CODE,
        ipAddress,
        reason);
  }
}
