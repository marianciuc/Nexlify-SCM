package com.marianciuc.nexifly.users.domain.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnboardCompanyResponse {

    private CompanyResponse company;
    private UserResponse adminUser;
    private LocationResponse legalLocation;
}
