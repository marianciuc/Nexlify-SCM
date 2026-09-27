package com.marianciuc.nexifly.users.domain.dto.response;

import com.marianciuc.nexifly.users.domain.enums.OrganizationType;
import com.marianciuc.nexifly.users.domain.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyResponse {

    private UUID id;
    private String legalName;
    private String tradeName;
    private String taxId;
    private String registrationCode;
    private OrganizationType organizationType;
    private VerificationStatus verificationStatus;
    private String email;
    private String phone;
    private String website;
    private BigDecimal rating;
    private long numberOfOrders;
    private boolean viesValid;
    private int paymentsTermsDays;
    private BigDecimal creditLimit;
    private BigDecimal creditUsed;
    private Instant createdAt;
    private Instant updatedAt;
}
