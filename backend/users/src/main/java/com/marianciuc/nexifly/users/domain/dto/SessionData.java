package com.marianciuc.nexifly.users.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SessionData(
        UUID userId,
        String email,
        String firstName,
        String lastName,
        UUID companyId,
        String companyName,
        List<String> roles,
        List<String> securityScopes,
        String environment,
        String keycloakJwt
) {
    public SessionData {
        if (roles == null) {
            roles = List.of();
        }
        if (securityScopes == null) {
            securityScopes = List.of();
        }
        if (environment == null || environment.isBlank()) {
            environment = "development";
        }
    }
}
