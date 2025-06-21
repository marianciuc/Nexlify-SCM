package works.marianciuc.logistic_commerce.userservice.domain.enums;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.Getter;

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

  public static boolean isIncluded(Resource resource, CompanyRole companyRole) {
    return resource.getAcceptedRoles().contains(companyRole);
  }

  public boolean isIncluded(CompanyRole companyRole) {
    return isIncluded(this, companyRole);
  }
}
