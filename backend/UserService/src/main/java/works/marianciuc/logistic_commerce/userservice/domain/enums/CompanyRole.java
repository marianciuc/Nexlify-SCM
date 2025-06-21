
package works.marianciuc.logistic_commerce.userservice.domain.enums;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Enumeration representing various roles within a company.
 *
 * <p>This enum defines roles such as logistic specialists, managers, drivers, and more, each
 * associated with specific responsibilities within the organization's operational and
 * administrative structure.
 *
 * <p>Each role is documented with a brief description of its function within the company. These
 * roles may also be utilized in conjunction with other enumerations, such as {@link Resource} and
 * {@link SystemRole}, to define access levels and system-layer capabilities.
 *
 * <p>The roles defined in this enumeration include: - LOGISTICIAN: Responsible for supply chain
 * management. - MANAGER: Oversees teams and projects. - DRIVER: Conducts transportation and
 * delivery. - WAREHOUSE_MANAGER: Handles inventory and storage operations. - SYSTEM_ADMINISTRATOR:
 * Manages technical system access. - MODERATOR: Ensures proper content and user management. -
 * ORDER_MANAGER: Manages order processing and fulfillment. - NOT_ASSIGNED: Represents a user with
 * no specific role assigned.
 */
@Schema(description = "Company role", example = "LOGISTICIAN")
public enum CompanyRole {
  @Schema(description = "Logistic specialist responsible for supply chain management")
  LOGISTICIAN,

  @Schema(description = "Manager responsible for team and project oversight")
  MANAGER,

  @Schema(description = "Driver responsible for transportation and delivery")
  DRIVER,

  @Schema(description = "Warehouse manager responsible for inventory and storage operations")
  WAREHOUSE_MANAGER,

  @Schema(description = "System administrator with technical system access")
  SYSTEM_ADMINISTRATOR,

  @Schema(description = "Moderator responsible for content and user management")
  MODERATOR,

  @Schema(description = "Order manager responsible for order processing and fulfillment")
  ORDER_MANAGER,

  @Schema(description = "User with no specific role assigned")
  NOT_ASSIGNED
}
