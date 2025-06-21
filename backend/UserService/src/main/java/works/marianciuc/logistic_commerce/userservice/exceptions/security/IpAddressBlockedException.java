package works.marianciuc.logistic_commerce.userservice.exceptions.security;

import works.marianciuc.logistic_commerce.userservice.exceptions.general.ForbiddenException;

/** Exception thrown when IP address is blocked or restricted. */
public class IpAddressBlockedException extends ForbiddenException {

  private static final String MESSAGE = "errors.security.ip.blocked";
  private static final String DOMAIN = "IP_BLOCKED";

  public IpAddressBlockedException(String ipAddress) {
    super(MESSAGE, DOMAIN, ipAddress);
  }

  public IpAddressBlockedException() {
    super(MESSAGE, DOMAIN);
  }
}
