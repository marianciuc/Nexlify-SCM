package works.marianciuc.logistic_commerce.userservice.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.SuperBuilder;
import works.marianciuc.logistic_commerce.userservice.domain.enums.AccountStatus;
import works.marianciuc.logistic_commerce.userservice.domain.enums.CompanyRole;
import works.marianciuc.logistic_commerce.userservice.domain.enums.Regions;
import works.marianciuc.logistic_commerce.userservice.domain.enums.SystemRole;
import works.marianciuc.logistic_commerce.userservice.exceptions.roles.UnsupportedRoleException;
import works.marianciuc.logistic_commerce.userservice.exceptions.user.*;

/**
 * Entity representing a user in the logistics commerce system.
 *
 * <p>This entity encapsulates all user-related information including personal details,
 * authentication data, roles, and account status. Users can be associated with companies and have
 * different roles within the system and company hierarchy.
 *
 * <p>The entity provides methods for account lifecycle management including activation, blocking,
 * and deletion, as well as role and permission management.
 */
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Entity
@Table(
    name = "users",
    indexes = {
      @Index(name = "idx_user_email", columnList = "email"),
      @Index(name = "idx_user_company", columnList = "company_id"),
      @Index(name = "idx_user_status", columnList = "account_status")
    })
public final class User extends BaseEntity {

  @NotBlank(message = "{errors.validation.email.invalid}")
  @Email(message = "{errors.validation.email.invalid}")
  @Column(unique = true, name = "email", nullable = false, length = 255)
  private String email;

  /**
   * -- GETTER -- Checks if the user's email is verified.
   *
   * @return true if email is verified, false otherwise
   */
  @Builder.Default
  @Column(name = "is_email_verified", nullable = false)
  private boolean isEmailVerified = false;

  @Setter
  @NotBlank(message = "{errors.validation.required}")
  @Column(name = "first_name", nullable = false, length = 100)
  private String firstName;

  @Setter
  @NotBlank(message = "{errors.validation.required}")
  @Column(name = "last_name", nullable = false, length = 100)
  private String lastName;

  @NotBlank(message = "{errors.validation.required}")
  @Column(name = "contact_number", nullable = false, length = 20)
  private String contactNumber;

  @NotNull(message = "{errors.validation.required}")
  @Enumerated(EnumType.STRING)
  @Column(name = "system_role", nullable = false, updatable = false, length = 50)
  private SystemRole systemRole;

  @NotNull(message = "{errors.validation.required}")
  @Enumerated(EnumType.STRING)
  @Column(name = "company_role", nullable = false, length = 50)
  private CompanyRole companyRole;

  @Setter
  @NotBlank(message = "{errors.validation.required}")
  @Column(name = "timezone", nullable = false, length = 100)
  private String timezone;

  @Setter
  @NotNull(message = "{errors.validation.required}")
  @Enumerated(EnumType.STRING)
  @Column(name = "country", nullable = false, length = 50)
  private Regions country;

  @Builder.Default
  @Enumerated(EnumType.STRING)
  @Column(name = "account_status", nullable = false, length = 20)
  private AccountStatus accountStatus = AccountStatus.PENDING;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "company_id", updatable = false)
  private Company company;

  @Builder.Default
  @Column(name = "data_processing_consent", nullable = false)
  private boolean dataProcessingConsent = false;

  /**
   * Soft deletes the user by marking it as deleted and updating the account status. This operation
   * is irreversible and the user will no longer be able to access the system.
   */
  @Override
  public void delete() {
    super.delete();
    this.accountStatus = AccountStatus.DELETED;
  }

  /**
   * Activates a pending user account.
   *
   * @throws InvalidAccountStatusException if the account is not in PENDING status
   */
  public void activate() throws InvalidAccountStatusException {
    if (this.accountStatus != AccountStatus.PENDING) {
      throw new InvalidAccountStatusException(
          this.accountStatus.name(), AccountStatus.PENDING.name());
    }
    this.accountStatus = AccountStatus.ACTIVE;
  }

  /**
   * Blocks an active user account.
   *
   * @throws InvalidAccountStatusException if the account is already blocked or not in a valid state
   *     for blocking
   */
  public void block() throws InvalidAccountStatusException {
    super.verifyRecord();

    if (this.accountStatus == AccountStatus.BLOCKED) {
      throw new InvalidAccountStatusException(this.accountStatus.name());
    }

    if (this.accountStatus == AccountStatus.DELETED) {
      throw new InvalidAccountStatusException(this.accountStatus.name());
    }

    this.accountStatus = AccountStatus.BLOCKED;
  }

  /**
   * Unblocks a blocked user account, restoring it to active status.
   *
   * @throws InvalidAccountStatusException if the account is not blocked or already active
   */
  public void unblock() throws InvalidAccountStatusException {
    super.verifyRecord();

    if (this.accountStatus == AccountStatus.ACTIVE) {
      throw new InvalidAccountStatusException(this.accountStatus.name());
    }

    if (this.accountStatus != AccountStatus.BLOCKED) {
      throw new InvalidAccountStatusException(this.accountStatus.name());
    }

    this.accountStatus = AccountStatus.ACTIVE;
  }

  /**
   * Updates the user's email address and marks it as unverified.
   *
   * @param email the new email address
   * @throws EmailUpdateException if the email is the same as the current one or invalid
   * @throws UserValidationException if the email format is invalid
   */
  public void updateEmail(@NotBlank @Email String email)
      throws EmailUpdateException, UserValidationException {
    if (email == null || email.trim().isEmpty()) {
      throw new UserValidationException("email", "cannot be empty");
    }

    String normalizedEmail = email.trim().toLowerCase();

    if (this.email != null && this.email.equals(normalizedEmail)) {
      throw new EmailUpdateException("same email provided");
    }

    this.email = normalizedEmail;
    this.isEmailVerified = false;
  }

  /**
   * Marks the email as verified.
   *
   * @throws EmailVerificationException if the email is already verified
   */
  public void verifyEmail() throws EmailVerificationException {
    if (this.isEmailVerified) {
      throw new EmailVerificationException("already verified");
    }
    this.isEmailVerified = true;
  }

  /**
   * Records the user's consent for data processing.
   *
   * @throws DataProcessingConsentException if consent has already been given
   */
  public void acceptDataProcessingConsent() throws DataProcessingConsentException {
    if (this.dataProcessingConsent) {
      throw new DataProcessingConsentException();
    }
    this.dataProcessingConsent = true;
  }

  /**
   * Updates the user's company role after validating it against the system role.
   *
   * @param companyRole the new company role
   * @throws UnsupportedRoleException if the role is not supported for the current system role
   * @throws UserValidationException if the company role is null
   */
  public void updateCompanyRole(@NotNull CompanyRole companyRole)
      throws UnsupportedRoleException, UserValidationException {
    if (companyRole == null) {
      throw new UserValidationException("companyRole", "cannot be null");
    }
    this.systemRole.validateCompanyRole(companyRole);
    this.companyRole = companyRole;
  }

  /**
   * Updates the user's contact number.
   *
   * @param contactNumber the new contact number
   * @throws UserValidationException if the contact number is null or empty
   */
  public void updateContactNumber(@NotBlank String contactNumber) throws UserValidationException {
    if (contactNumber == null || contactNumber.trim().isEmpty()) {
      throw new UserValidationException("contactNumber", "cannot be empty");
    }
    this.contactNumber = contactNumber.trim();
  }

  /**
   * Checks if the user account is operational (active and not deleted).
   *
   * @return true if the account is active, false otherwise
   */
  public boolean isAccountOperational() {
    return this.accountStatus != null && this.accountStatus.isOperational();
  }

  /**
   * Gets the user's full name.
   *
   * @return the concatenated first and last name
   */
  public String getFullName() {
    if (firstName == null && lastName == null) {
      return "";
    }
    if (firstName == null) {
      return lastName;
    }
    if (lastName == null) {
      return firstName;
    }
    return firstName + " " + lastName;
  }

  /**
   * Checks if the user is associated with a company.
   *
   * @return true if the user has a company association, false otherwise
   */
  public boolean hasCompany() {
    return this.company != null;
  }

  /**
   * Checks if the user has given data processing consent.
   *
   * @return true if consent has been given, false otherwise
   */
  public boolean hasDataProcessingConsent() {
    return this.dataProcessingConsent;
  }
}
