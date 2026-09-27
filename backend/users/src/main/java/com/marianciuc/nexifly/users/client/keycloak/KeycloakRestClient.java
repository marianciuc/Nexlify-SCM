package com.marianciuc.nexifly.users.client.keycloak;

import com.marianciuc.nexifly.users.client.keycloak.model.KeycloakTokenResponse;
import com.marianciuc.nexifly.users.client.keycloak.model.KeycloakUserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Component
@Slf4j
@RequiredArgsConstructor
public class KeycloakRestClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${keycloak.auth-server-url:http://localhost:9090}")
    private String serverUrl;

    @Value("${keycloak.realm:nexlify}")
    private String realm;

    @Value("${keycloak.resource:application-client}")
    private String clientId;

    @Value("${keycloak.credentials.secret:v8lNkDJFwbcrMsTe7TZ5OQVE3gTYqd2f}")
    private String clientSecret;

    @Value("${keycloak.admin-username:admin}")
    private String adminUsername;

    @Value("${keycloak.admin-password:admin}")
    private String adminPassword;

    public Optional<KeycloakTokenResponse> getTokenByPassword(String username, String password) {
        String url = String.format("%s/realms/%s/protocol/openid-connect/token", serverUrl, realm);
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("grant_type", "password");
        map.add("client_id", clientId);
        map.add("client_secret", clientSecret);
        map.add("username", username);
        map.add("password", password);

        return executeTokenRequest(url, map);
    }

    public Optional<KeycloakTokenResponse> getTokenByCode(String code, String redirectUri) {
        String url = String.format("%s/realms/%s/protocol/openid-connect/token", serverUrl, realm);
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("grant_type", "authorization_code");
        map.add("client_id", clientId);
        map.add("client_secret", clientSecret);
        map.add("code", code);
        map.add("redirect_uri", redirectUri);

        return executeTokenRequest(url, map);
    }

    public Optional<KeycloakTokenResponse> refreshToken(String refreshToken) {
        String url = String.format("%s/realms/%s/protocol/openid-connect/token", serverUrl, realm);
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("grant_type", "refresh_token");
        map.add("client_id", clientId);
        map.add("client_secret", clientSecret);
        map.add("refresh_token", refreshToken);

        return executeTokenRequest(url, map);
    }

    public Optional<String> getAdminAccessToken() {
        String url = String.format("%s/realms/master/protocol/openid-connect/token", serverUrl);
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("grant_type", "password");
        map.add("client_id", "admin-cli");
        map.add("username", adminUsername);
        map.add("password", adminPassword);

        return executeTokenRequest(url, map).map(KeycloakTokenResponse::getAccessToken);
    }

    public Optional<String> createUser(String email, String firstName, String lastName, String password) {
        Optional<String> adminToken = getAdminAccessToken();
        if (adminToken.isEmpty()) {
            log.warn("Could not acquire admin token to create Keycloak user");
            return Optional.empty();
        }

        try {
            String url = String.format("%s/admin/realms/%s/users", serverUrl, realm);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(adminToken.get());

            Map<String, Object> userPayload = new HashMap<>();
            userPayload.put("username", email);
            userPayload.put("email", email);
            userPayload.put("firstName", firstName);
            userPayload.put("lastName", lastName);
            userPayload.put("enabled", true);
            userPayload.put("emailVerified", true);

            if (password != null && !password.isBlank()) {
                Map<String, Object> credential = new HashMap<>();
                credential.put("type", "password");
                credential.put("value", password);
                credential.put("temporary", false);
                userPayload.put("credentials", List.of(credential));
            }

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(userPayload, headers);
            ResponseEntity<Void> response = restTemplate.postForEntity(url, request, Void.class);

            if (response.getStatusCode().equals(HttpStatus.CREATED)) {
                String location = response.getHeaders().getLocation() != null ? response.getHeaders().getLocation().getPath() : null;
                if (location != null) {
                    String createdId = location.substring(location.lastIndexOf('/') + 1);
                    return Optional.of(createdId);
                }
            }
        } catch (Exception e) {
            log.warn("Keycloak user creation failed: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public void assignRealmRole(String keycloakUserId, String roleName) {
        Optional<String> adminToken = getAdminAccessToken();
        if (adminToken.isEmpty()) return;

        try {
            // 1. Get role representation
            String roleUrl = String.format("%s/admin/realms/%s/roles/%s", serverUrl, realm, roleName);
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(adminToken.get());
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<?> getReq = new HttpEntity<>(headers);
            ResponseEntity<Map> roleResp = restTemplate.exchange(roleUrl, HttpMethod.GET, getReq, Map.class);

            if (roleResp.getStatusCode().is2xxSuccessful() && roleResp.getBody() != null) {
                // 2. Assign role to user
                String assignUrl = String.format("%s/admin/realms/%s/users/%s/role-mappings/realm", serverUrl, realm, keycloakUserId);
                HttpEntity<List<Map>> assignReq = new HttpEntity<>(List.of(roleResp.getBody()), headers);
                restTemplate.postForEntity(assignUrl, assignReq, Void.class);
                log.info("Assigned role {} to Keycloak user {}", roleName, keycloakUserId);
            }
        } catch (Exception e) {
            log.warn("Failed to assign role {} to user {}: {}", roleName, keycloakUserId, e.getMessage());
        }
    }

    private Optional<KeycloakTokenResponse> executeTokenRequest(String url, MultiValueMap<String, String> map) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(map, headers);

            ResponseEntity<KeycloakTokenResponse> response = restTemplate.postForEntity(url, entity, KeycloakTokenResponse.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return Optional.of(response.getBody());
            }
        } catch (Exception e) {
            log.warn("Keycloak token endpoint call to {} failed: {}", url, e.getMessage());
        }
        return Optional.empty();
    }
}
