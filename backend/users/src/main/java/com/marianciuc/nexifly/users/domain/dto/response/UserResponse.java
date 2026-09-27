package com.marianciuc.nexifly.users.domain.dto.response;

import com.marianciuc.nexifly.users.domain.enums.AccountStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private UUID id;
    private UUID companyId;
    private String keycloakId;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private AccountStatus accountStatus;
    private boolean isEmailVerified;
    private boolean dataProcessingConsent;
    private String timezone;
    private Instant createdAt;
}
