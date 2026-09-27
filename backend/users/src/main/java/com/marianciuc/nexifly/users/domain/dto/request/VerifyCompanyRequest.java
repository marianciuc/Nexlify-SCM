package com.marianciuc.nexifly.users.domain.dto.request;

import com.marianciuc.nexifly.users.domain.enums.VerificationStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyCompanyRequest {

    @NotNull(message = "Verification status is required")
    private VerificationStatus status; // VERIFIED or REJECTED

    @DecimalMin(value = "0.00", message = "Credit limit cannot be negative")
    private BigDecimal creditLimit;

    @Min(value = 0, message = "Payment terms days cannot be negative")
    private Integer paymentsTermsDays;
}
