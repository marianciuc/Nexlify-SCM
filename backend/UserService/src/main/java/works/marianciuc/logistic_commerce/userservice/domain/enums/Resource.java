package works.marianciuc.logistic_commerce.userservice.domain.enums;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.Getter;

/**
 * Enumeration representing various resources within the application and the corresponding company
 * roles that have access to each resource.
 *
 * <p>This enum defines resource types such as administrative panels and customer panels, and links
 * them to the roles that are authorized to access these resources. It includes functionality to
 * check whether a specific company role is permitted for a resource.
 *
 * <p>Each resource is documented with its description and the roles associated with it.
 *
 * <p>Roles are defined in the {@link CompanyRole} enumeration.
 */
@Getter
@Schema(description = "Resource type", example = "CUSTOMER_PANEL")
public enum Resource {
  @Schema(description = "Admin panel resource")
  SYSTEM_ADMINISTRATOR_PANEL(List.of(CompanyRole.SYSTEM_ADMINISTRATOR, CompanyRole.MODERATOR)),
  @Schema(description = "Customer panel resource")
  CUSTOMER_PANEL(
      List.of(
          CompanyRole.SYSTEM_ADMINISTRATOR,
          CompanyRole.MANAGER,
          CompanyRole.ORDER_MANAGER,
          CompanyRole.NOT_ASSIGNED,
          CompanyRole.WAREHOUSE_MANAGER)),
  @Schema(description = "Logistician panel resource")
  LOGISTICIAN_PANEL(List.of(CompanyRole.LOGISTICIAN)),
  @Schema(description = "Driver panel resource")
  DRIVER_PANEL(List.of(CompanyRole.DRIVER));

  private final List<CompanyRole> acceptedRoles;

  Resource(List<CompanyRole> acceptedRoles) {
    this.acceptedRoles = acceptedRoles;
  }

  public boolean isIncluded(CompanyRole companyRole) {
    return this.acceptedRoles.contains(companyRole);
  }
}
