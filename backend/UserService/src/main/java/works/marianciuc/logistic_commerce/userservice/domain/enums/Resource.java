package works.marianciuc.logistic_commerce.userservice.domain.enums;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

/**
 * Enum representing various resources within the system.
 *
 * <p>Each resource corresponds to a specific panel or section of the application. It is associated
 * with a required security possibility that governs access permissions.
 *
 * <p>Functionalities: - Defines constants for specific resource types (e.g.,
 * SYSTEM_ADMINISTRATOR_PANEL, CUSTOMER_PANEL, LOGISTICIAN_PANEL). - Each constant is mapped to a
 * corresponding {@link SecurityScope} indicating the access level required for that resource.
 *
 * <p>Constants: - SYSTEM_ADMINISTRATOR_PANEL: Represents the administrator panel resource. -
 * CUSTOMER_PANEL: Represents the customer panel resource. - LOGISTICIAN_PANEL: Represents the
 * logistician panel resource.
 *
 * <p>All constants are annotated with descriptions and examples for API documentation purposes.
 */
@Getter
@Schema(description = "Resource type", example = "CUSTOMER_PANEL")
public enum Resource {
  @Schema(description = "Admin panel resource")
  SYSTEM_ADMINISTRATOR_PANEL(SecurityScope.MOD_001_002),
  @Schema(description = "Customer panel resource")
  CUSTOMER_PANEL(SecurityScope.MOD_001_004),
  @Schema(description = "Logistician panel resource")
  LOGISTICIAN_PANEL(SecurityScope.MOD_001_003);

  private final SecurityScope shouldHavePossibility;

  Resource(SecurityScope acceptedRoles) {
    this.shouldHavePossibility = acceptedRoles;
  }

  /**
   * Checks if this resource is accessible to a user with the given role. A resource is accessible
   * if the user's role includes the security scope required by this resource.
   *
   * @param role The role to check
   * @return true if the role has access to this resource, false otherwise
   */
  public boolean isIncluded(Role role) {
    if (role == null) {
      return false;
    }
    return role.getSecurityPossibilities().contains(this.shouldHavePossibility);
  }
}
