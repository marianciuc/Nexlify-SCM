package works.marianciuc.logistic_commerce.userservice.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;
import lombok.experimental.SuperBuilder;
import works.marianciuc.logistic_commerce.userservice.domain.enums.AccountStatus;
import works.marianciuc.logistic_commerce.userservice.domain.enums.CompanyRole;
import works.marianciuc.logistic_commerce.userservice.domain.enums.Regions;
import works.marianciuc.logistic_commerce.userservice.domain.enums.SystemRole;
import works.marianciuc.logistic_commerce.userservice.exceptions.roles.UnsupportedRoleException;

@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Entity
@Table(name = "users")
public final class User extends BaseEntity {

  @Column(unique = true, name = "email", nullable = false)
  private String email;

  @Builder.Default
  @Column(name = "is_email_verified", nullable = false)
  private boolean isEmailVerified = false;

  @Setter
  @Column(name = "first_name", nullable = false)
  private String firstName;

  @Setter
  @Column(name = "last_name", nullable = false)
  private String lastName;

  @Column(name = "contact_number", nullable = false)
  private String contactNumber;

  @Enumerated(EnumType.STRING)
  @Column(name = "system_role", nullable = false, updatable = false)
  private SystemRole systemRole;

  @Enumerated(EnumType.STRING)
  @Column(name = "company_role", nullable = false)
  private CompanyRole companyRole;

  @Setter
  @Column(name = "timezone", nullable = false)
  private String timezone;

  @Setter
  @Enumerated(EnumType.STRING)
  @Column(name = "country", nullable = false)
  private Regions country;

  @Builder.Default
  @Column(name = "account_status", nullable = false)
  private AccountStatus accountStatus = AccountStatus.PENDING;

  @ManyToOne
  @JoinColumn(name = "company_id", nullable = true, updatable = false)
  private Company company;

  @Getter
  @Builder.Default
  @Column(name = "data_processing_consent")
  private boolean dataProcessingConsent = false;

  @Override
  public void delete() {
    super.delete();
    this.accountStatus = AccountStatus.DELETED;
  }

  public void activate() {
    if (this.accountStatus == AccountStatus.PENDING) this.accountStatus = AccountStatus.ACTIVE;
    else throw new IllegalStateException("Account is not pending");
  }

  public void block() {
    super.verifyRecord();
    if (this.accountStatus == AccountStatus.BLOCKED)
      throw new IllegalStateException("Account is already blocked");

    this.accountStatus = AccountStatus.BLOCKED;
  }

  public void unblock() {
    super.verifyRecord();
    if (this.accountStatus == AccountStatus.ACTIVE)
      throw new IllegalStateException("Account is already active");
    if (this.accountStatus != AccountStatus.BLOCKED)
      throw new IllegalStateException("Account is not blocked");

    this.accountStatus = AccountStatus.ACTIVE;
  }

  public void updateEmail(@Email String email) {
    if (this.email.equals(email))
      throw new IllegalArgumentException("Email is already set to " + email);
    this.email = email;
    this.isEmailVerified = false;
  }

  public void acceptDataProcessingConsent() throws IllegalStateException {
    if (this.dataProcessingConsent)
      throw new IllegalStateException("Data processing consent has already been accepted.");
    this.dataProcessingConsent = true;
  }

  public void updateCompanyRole(CompanyRole companyRole) throws UnsupportedRoleException {
    this.systemRole.isAllowedCompanyRole(companyRole);
    this.companyRole = companyRole;
  }
}
