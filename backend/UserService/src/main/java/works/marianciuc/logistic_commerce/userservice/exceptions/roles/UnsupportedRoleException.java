package works.marianciuc.logistic_commerce.userservice.exceptions.roles;


import works.marianciuc.logistic_commerce.userservice.domain.enums.CompanyRole;
import works.marianciuc.logistic_commerce.userservice.exceptions.general.InvalidArgumentException;

public class UnsupportedRoleException extends InvalidArgumentException {

  private static final String MESSAGE = "errors.role.unsupported";
  private static final String DOMAIN = "ROLE";

  public UnsupportedRoleException(CompanyRole role) {
    super(MESSAGE, DOMAIN, role.name());
  }
}
