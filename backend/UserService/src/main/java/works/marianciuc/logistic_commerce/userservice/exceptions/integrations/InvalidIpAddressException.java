package works.marianciuc.logistic_commerce.userservice.exceptions.integrations;

import works.marianciuc.logistic_commerce.userservice.exceptions.general.InvalidArgumentException;

/** Exception thrown when an invalid IP address is provided. */
public class InvalidIpAddressException extends InvalidArgumentException {

  private static final String MESSAGE_KEY = "errors.validation.ip_address.invalid";
  private static final String ERROR_CODE = "INVALID_IP_ADDRESS";

  public InvalidIpAddressException(String ipAddress) {
    super(MESSAGE_KEY, ERROR_CODE, ipAddress);
  }
}
