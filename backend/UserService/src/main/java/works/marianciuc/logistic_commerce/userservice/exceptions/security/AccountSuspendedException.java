package works.marianciuc.logistic_commerce.userservice.exceptions.security;

import works.marianciuc.logistic_commerce.userservice.exceptions.general.ForbiddenException;

/** Exception thrown when account is suspended or inactive. */
public class AccountSuspendedException extends ForbiddenException {

  private static final String MESSAGE = "errors.security.account.suspended";
  private static final String DOMAIN = "ACCOUNT_SUSPENDED";

  public AccountSuspendedException() {
    super(MESSAGE, DOMAIN);
  }

  public AccountSuspendedException(String reason) {
    super(MESSAGE, DOMAIN, reason);
  }
}
