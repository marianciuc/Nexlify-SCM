package works.marianciuc.logistic_commerce.userservice.exceptions.security;

import works.marianciuc.logistic_commerce.userservice.exceptions.general.ForbiddenException;

/** Exception thrown when user lacks sufficient permissions for an operation. */
public class InsufficientPermissionsException extends ForbiddenException {

  private static final String MESSAGE = "errors.security.permissions.insufficient";
  private static final String DOMAIN = "INSUFFICIENT_PERMISSIONS";

  public InsufficientPermissionsException() {
    super(MESSAGE, DOMAIN);
  }

  public InsufficientPermissionsException(String requiredPermission) {
    super(MESSAGE, DOMAIN, requiredPermission);
  }
}
