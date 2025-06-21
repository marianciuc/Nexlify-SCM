package works.marianciuc.logistic_commerce.userservice.domain.enums;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.Getter;
import works.marianciuc.logistic_commerce.userservice.exceptions.roles.UnsupportedRoleException;

/**
 * Enumeration representing different system roles within the application.
 *
 * <p>This enum defines two system roles: CUSTOMER and EMPLOYEE. Each role has a list of allowed
 * company roles and a default company role associated with it. The roles and their descriptions are
 * as follows:
 *
 * <p>CUSTOMER: Represents the customer layer within the system. This role allows specific company
 * roles such as WAREHOUSE_MANAGER, MANAGER, ORDER_MANAGER, and NOT_ASSIGNED. The default company
 * role for this system role is NOT_ASSIGNED.
 *
 * <p>EMPLOYEE: Represents the employee layer within the system. This role allows specific company
 * roles such as LOGISTICIAN, DRIVER, and SYSTEM_ADMINISTRATOR. The default company role for this
 * system role is SYSTEM_ADMINISTRATOR.
 *
 * <p>Methods are provided to validate whether a specific company role is allowed for a given system
 * role and to enforce this validation by throwing an exception if the validation fails.
 *
 * <p>Each system role is documented with its description and corresponding allowed company roles.
 */
@Getter
@Schema(description = "System role", example = "CUSTOMER")
public enum SystemRole {
  @Schema(description = "Customer layer")
  CUSTOMER(
      List.of(
          CompanyRole.WAREHOUSE_MANAGER,
          CompanyRole.MANAGER,
          CompanyRole.ORDER_MANAGER,
          CompanyRole.NOT_ASSIGNED),
      CompanyRole.NOT_ASSIGNED),
  @Schema(description = "Employee layer")
  EMPLOYEE(
      List.of(CompanyRole.LOGISTICIAN, CompanyRole.DRIVER, CompanyRole.SYSTEM_ADMINISTRATOR),
      CompanyRole.SYSTEM_ADMINISTRATOR);

  private final List<CompanyRole> allowedCompanyRoles;
  private final CompanyRole defaultCompanyRole;

  SystemRole(List<CompanyRole> allowedCompanyRoles, CompanyRole companyRole) {
    this.allowedCompanyRoles = allowedCompanyRoles;
    this.defaultCompanyRole = companyRole;
  }

  public boolean isCompanyRoleAllowed(CompanyRole companyRole) {
    return this.allowedCompanyRoles.contains(companyRole);
  }

  public void validateCompanyRole(CompanyRole companyRole) throws UnsupportedRoleException {
    if (!isCompanyRoleAllowed(companyRole)) {
      throw new UnsupportedRoleException(companyRole);
    }
  }
}
