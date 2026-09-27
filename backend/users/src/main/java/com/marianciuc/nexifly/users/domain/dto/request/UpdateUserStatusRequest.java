package com.marianciuc.nexifly.users.domain.dto.request;

import com.marianciuc.nexifly.users.domain.enums.AccountStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserStatusRequest {

    @NotNull(message = "Account status is required")
    private AccountStatus status;
}
