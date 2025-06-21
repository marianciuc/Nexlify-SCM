package works.marianciuc.logistic_commerce.userservice.domain.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Company verification status", example = "NOT_VERIFIED")
public enum CompanyVerificationStatus {
  NOT_VERIFIED,
  PENDING,
  VERIFIED,
  REJECTED
}
