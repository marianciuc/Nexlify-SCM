package works.marianciuc.logistic_commerce.userservice.domain.enums;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

/**
 * Enumeration representing various security possibilities within the system.
 *
 * <p>Each constant in this enum defines a specific security-related permission or functionality
 * that can be granted to users, typically within specific modules of the application. These
 * constants are categorized into different modules, each addressing a distinct area of application
 * operations.
 *
 * <p>Modules: - MOD_001: User management module - MOD_002: Company module - MOD_003: Order module -
 * MOD_004: Warehouse module
 */
@Schema(
    name = "SecurityScope",
    description = "Security possibility",
    example = "MOD_001_001",
    enumAsRef = true,
    required = true)
@Getter
public enum SecurityScope {

  // MOD_001 -> User management module

  MOD_001_001("Create new project staff accounts"),
  MOD_001_002("Access to the administrator panel"),
  MOD_001_003("Access to the logistic panel"),
  MOD_001_004("Access to the store page"),
  MOD_001_104("Access to the warehouse panel, trade page"),
  MOD_001_005("FNC: create or approve new company staff accounts"),
  MOD_001_006("FNC: Change user statuses (BLOCK, UNBLOCK, etc.)"),
  MOD_001_007("View detailed personal staff information"),

  // MOD_002 -> Company module

  MOD_002_001("Create a new company"),
  MOD_002_002("FNC: update, delete company"),
  MOD_002_003("VIEW: detailed company information. Address, contacts, etc."),
  MOD_002_004("FNC: update company status (BLOCK, VERIFY, etc.)"),
  MOD_002_005("FNC: upload verification documents and initialize verification process"),

  // MOD_003 -> Order module

  MOD_003_001("Place open company order"),
  MOD_003_002("Update order if status is OPEN"),
  MOD_003_003("Update order if status is IN_PROGRESS"),
  MOD_003_004("View detailed order information"),
  MOD_003_005("FNC: update order status (CANCELLED, COMPLETED, etc.)"),
  MOD_003_006("FNC: Offer a discount or change price"),
  MOD_003_007("FNC: Change delivery price"),
  MOD_003_008("FNC: Suggest your own order option in response to an open order"),
  MOD_003_009("FNC: Accept/Reject suggested order option in response to an open order"),
  MOD_003_010("FNC: Accept or reject order"),

  // MOD_004 -> Warehouse & Items

  MOD_004_001("VIEW: Position information"),
  MOD_004_002("FNC: Create new position"),
  MOD_004_003("FNC: Initiate delivery in warehouse"),
  MOD_004_004("VIEW: Public price item"),
  MOD_004_005("VIEW: Private price item"),
  MOD_004_006("FNC: Change item prices"),
  MOD_004_007("FNC: Create sub positions (this position with another price)"),
  MOD_004_008("FNC: Create/ Update categories"),
  MOD_004_009("FNC: Suggest change item count in warehouse"),
  MOD_004_010("FNC: Approve change item suggestion"),
  MOD_004_011("FNC: CRUD warehouse (Create new, update, delete, etc.)"),
  ;
  private final String description;

  SecurityScope(String description) {
    this.description = description;
  }
}
