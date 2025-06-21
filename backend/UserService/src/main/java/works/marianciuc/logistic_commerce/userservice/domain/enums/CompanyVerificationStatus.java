package works.marianciuc.logistic_commerce.userservice.domain.enums;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Enumeration representing the verification status of a company within the system.
 *
 * <p>This enum defines the possible states of company verification, ranging from initial unverified
 * status through pending verification to final verified or rejected states. It provides utility
 * methods to check verification status and convert from string values.
 *
 * <p>Constants: - NOT_VERIFIED: Initial status when a company is first registered - PENDING: Status
 * when company verification is in progress - VERIFIED: Status when company has been successfully
 * verified - REJECTED: Status when company verification has been rejected
 *
 * <p>Functionalities: - Convert string values to enum constants using fromString method - Check if
 * a company is verified using isVerified method - Check if verification is pending using isPending
 * method
 *
 * <p>Each status is documented with its description and use case within the verification workflow.
 */
@Schema(description = "Company verification status", example = "NOT_VERIFIED")
public enum CompanyVerificationStatus {
  @Schema(description = "Company not verified")
  NOT_VERIFIED,

  @Schema(description = "Company verification pending")
  PENDING,

  @Schema(description = "Company verified")
  VERIFIED,

  @Schema(description = "Company verification rejected")
  REJECTED;

  /**
   * Converts a string value to the corresponding CompanyVerificationStatus enum constant.
   *
   * <p>This method attempts to match the provided string (case-insensitive) to one of the defined
   * verification status values. If no match is found, it returns null.
   *
   * @param status the string representation of the verification status
   * @return the corresponding CompanyVerificationStatus enum constant, or null if no match found
   */
  public static CompanyVerificationStatus fromString(String status) {
    if (status == null) {
      return null;
    }
    try {
      return CompanyVerificationStatus.valueOf(status.toUpperCase());
    } catch (IllegalArgumentException e) {
      return null;
    }
  }

  /**
   * Checks if the current verification status represents a verified company.
   *
   * @return true if the status is VERIFIED, false otherwise
   */
  public boolean isVerified() {
    return this == VERIFIED;
  }

  /**
   * Checks if the current verification status represents a pending verification.
   *
   * @return true if the status is PENDING, false otherwise
   */
  public boolean isPending() {
    return this == PENDING;
  }
}
