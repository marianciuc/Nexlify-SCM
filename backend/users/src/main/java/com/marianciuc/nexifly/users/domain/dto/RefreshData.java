package com.marianciuc.nexifly.users.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RefreshData(
        UUID userId,
        UUID companyId,
        String email,
        String firstName,
        String lastName,
        String companyName,
        List<String> roles,
        List<String> securityScopes,
        String keycloakRefreshToken
) {}
