package works.marianciuc.logistic_commerce.userservice.domain.enums;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

/**
 * Enumeration representing the different possible statuses for an account.
 *
 * <p>This enum defines the following account statuses:
 *
 * <p>ACTIVE: Indicates that the account is currently active and operational. BLOCKED: Indicates
 * that the account has been blocked and is not accessible. DELETED: Indicates that the account has
 * been removed from the system. PENDING: Indicates that the account is awaiting activation and is
 * not fully operational.
 *
 * <p>Each status is represented with a description for clarity and carries specific semantic
 * meaning to reflect the account's state within the system.
 */
@Getter
@Schema(description = "Account status", example = "ACTIVE")
public enum AccountStatus {
  @Schema(description = "Account is active")
  ACTIVE("Active"),
  @Schema(description = "Account is blocked")
  BLOCKED("Blocked"),
  @Schema(description = "Account is deleted")
  DELETED("Deleted"),
  @Schema(description = "Account is pending activation")
  PENDING("Pending Activation");

  private final String displayName;

  AccountStatus(String displayName) {
    this.displayName = displayName;
  }

  /**
   * Retrieves an AccountStatus by its name (case-insensitive).
   *
   * @param name the name of the account status to retrieve
   * @return the AccountStatus corresponding to the provided name
   * @throws IllegalArgumentException if no matching status is found or name is null
   */
  public static AccountStatus fromString(String name) {
    if (name == null) {
      throw new IllegalArgumentException("Account status name cannot be null");
    }
    try {
      return AccountStatus.valueOf(name.toUpperCase());
    } catch (IllegalArgumentException e) {
      throw new IllegalArgumentException("Invalid account status: " + name);
    }
  }

  /**
   * Checks if the account status represents an operational state.
   *
   * @return true if the account is in ACTIVE status, false otherwise
   */
  public boolean isOperational() {
    return this == ACTIVE;
  }
}
