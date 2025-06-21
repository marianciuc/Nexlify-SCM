package works.marianciuc.logistic_commerce.userservice.domain.enums;

import java.util.List;
import lombok.Getter;
import works.marianciuc.logistic_commerce.userservice.exceptions.roles.UnsupportedRoleException;

@Getter
public enum SystemRole {
  CUSTOMER(
      List.of(
          CompanyRole.WAREHOUSE_MANAGER,
          CompanyRole.MANAGER,
          CompanyRole.ORDER_MANAGER,
          CompanyRole.NOT_ASSIGNED),
      CompanyRole.NOT_ASSIGNED),
  EMPLOYEE(
      List.of(CompanyRole.LOGISTICIAN, CompanyRole.DRIVER, CompanyRole.SYSTEM_ADMINISTRATOR),
      CompanyRole.SYSTEM_ADMINISTRATOR);

  private final List<CompanyRole> allowedCompanyRoles;
  private final CompanyRole defaultCompanyRole;

  SystemRole(List<CompanyRole> allowedCompanyRoles, CompanyRole companyRole) {
    this.allowedCompanyRoles = allowedCompanyRoles;
    this.defaultCompanyRole = companyRole;
  }

  public static void isAllowedCompanyRole(SystemRole systemRole, CompanyRole companyRole)
      throws UnsupportedRoleException {
    if (systemRole.getAllowedCompanyRoles().contains(companyRole))
      throw new UnsupportedRoleException("This role is not allowed for this system role");
  }

  public void isAllowedCompanyRole(CompanyRole companyRole) throws UnsupportedRoleException {
    if (this.getAllowedCompanyRoles().contains(companyRole))
      throw new UnsupportedRoleException("This role is not allowed for this system role");
  }
}
