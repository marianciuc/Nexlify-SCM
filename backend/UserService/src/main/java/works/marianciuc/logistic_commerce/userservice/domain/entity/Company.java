package works.marianciuc.logistic_commerce.userservice.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import works.marianciuc.logistic_commerce.userservice.domain.enums.CompanyVerificationStatus;

@Entity
@SuperBuilder
@NoArgsConstructor
@Table(name = "companies")
@Getter
public final class Company extends BaseEntity {

  @Setter
  @Column(name = "legal_name", nullable = false)
  private String name;

  @Column(name = "tax_id", unique = true, updatable = false) // NIP (Poland) or USCC (China)
  private String taxId;

  @Column(name = "email", unique = true, nullable = false)
  private String email;

  @Builder.Default
  @Enumerated(EnumType.STRING)
  @Column(name = "verification_status")
  private CompanyVerificationStatus verificationStatus = CompanyVerificationStatus.NOT_VERIFIED;

  @Column(name = "rating")
  @Builder.Default
  private double rating = 0;

  @Embedded private Address address;

  @Builder.Default
  @Column(name = "number_of_orders")
  private long numberOfOrders = 0;

  @Builder.Default
  @Column(name = "number_of_ratings")
  private long numberOfRatings = 0;

  public void increaseNumberOfOrders() {
    this.numberOfOrders++;
  }

  public void verify() throws IllegalStateException {
    super.verifyRecord();
    if (this.verificationStatus == CompanyVerificationStatus.PENDING)
      this.verificationStatus = CompanyVerificationStatus.VERIFIED;
    else throw new IllegalStateException("Company is not pending");
  }

  public void reject() throws IllegalStateException {
    super.verifyRecord();
    if (this.verificationStatus == CompanyVerificationStatus.PENDING)
      this.verificationStatus = CompanyVerificationStatus.REJECTED;
    else throw new IllegalStateException("Company is not pending");
  }

  public void processVerification() throws IllegalStateException {
    super.verifyRecord();
    if (this.verificationStatus != CompanyVerificationStatus.NOT_VERIFIED
        && this.verificationStatus != CompanyVerificationStatus.REJECTED)
      throw new IllegalStateException("Company is already processed");
    this.verificationStatus = CompanyVerificationStatus.PENDING;
  }

  public void rate(double rating) {
    super.verifyRecord();
    this.rating = (this.rating * this.numberOfRatings + rating) / (this.numberOfRatings + 1);
    this.numberOfRatings++;
  }
}
