package works.marianciuc.logistic_commerce.userservice.services.impl;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.OAuth2Constants;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import works.marianciuc.logistic_commerce.userservice.domain.dto.KeycloakTokenResponse;
import works.marianciuc.logistic_commerce.userservice.domain.dto.TokenPair;
import works.marianciuc.logistic_commerce.userservice.services.AuthService;

@Service
@Slf4j
public class KeycloakAuthServiceImpl implements AuthService {

  private final RestTemplate restTemplate;
  private final HttpHeaders headers;

  @Value("${keycloak.admin.realm}")
  private String realm;

  @Value("${keycloak.admin.auth-server-url}")
  private String authServerUrl;

  @Value("${keycloak.admin.client-id}")
  private String clientId;

  @Value("${keycloak.admin.client-secret}")
  private String clientSecret;

  private String tokenUrl;
  private String revokeUrl;

  public KeycloakAuthServiceImpl(RestTemplate restTemplate) {
    this.restTemplate = restTemplate;
    this.headers = new HttpHeaders();
    this.headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
  }

  @PostConstruct
  private void initializeTokenUrl() {
    this.tokenUrl =
        String.format("%s/realms/%s/protocol/openid-connect/token", authServerUrl, realm);
    this.revokeUrl = String.format("%s/realms/%s/protocol/openid-connect/revoke", revokeUrl, realm);

    if (log.isDebugEnabled()) {
      log.debug(
          "KeycloakAuthServiceImpl created. Actual tokenUrl: {}, revokeUrl: {}",
          tokenUrl,
          revokeUrl);
    }
  }

  @Override
  public ResponseEntity<TokenPair> login(String username, String password) {
    if (log.isDebugEnabled()) log.debug("KeycloakAuthServiceImpl login called");

    MultiValueMap<String, String> body = buildTokenRequestBody(OAuth2Constants.PASSWORD);
    body.add(OAuth2Constants.USERNAME, username);
    body.add(OAuth2Constants.PASSWORD, password);
    body.add(OAuth2Constants.SCOPE, "openid");

    HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
    return executeRequest(request);
  }

  @Override
  public ResponseEntity<TokenPair> refresh(String refreshToken) {
    if (log.isDebugEnabled()) log.debug("KeycloakAuthServiceImpl refresh called");
    MultiValueMap<String, String> body = buildTokenRequestBody(OAuth2Constants.REFRESH_TOKEN);
    body.add(OAuth2Constants.REFRESH_TOKEN, refreshToken);

    HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
    return executeRequest(request);
  }

  @Override
  public ResponseEntity<Void> logout(String refreshToken) {
    if (log.isDebugEnabled()) log.debug("KeycloakAuthServiceImpl logout called");

    MultiValueMap<String, String> body = buildTokenRequestBody(null);
    body.add(OAuth2Constants.TOKEN, refreshToken);

    HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

    try {
      ResponseEntity<Void> response = restTemplate.postForEntity(revokeUrl, request, Void.class);

      if (response.getStatusCode().is2xxSuccessful()) {
        return response;
      } else {
        log.error(
            "KeycloakAuthServiceImpl logout failed. Status code: {}", response.getStatusCode());
        throw new RuntimeException("Failed to logout: " + response.getStatusCode());
      }
    } catch (RestClientException e) {
      log.error("KeycloakAuthServiceImpl logout failed", e);
      throw new RuntimeException("Failed to logout: " + e.getMessage());
    }
  }

  private MultiValueMap<String, String> buildTokenRequestBody(String grantType) {
    MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
    if (grantType != null) body.add(OAuth2Constants.GRANT_TYPE, grantType);
    body.add(OAuth2Constants.CLIENT_ID, clientId);
    body.add(OAuth2Constants.CLIENT_SECRET, clientSecret);
    return body;
  }

  private ResponseEntity<TokenPair> fromResponse(KeycloakTokenResponse tokenResponse) {
    return ResponseEntity.ok(
        new TokenPair(
            tokenResponse.accessToken(), tokenResponse.refreshToken(), tokenResponse.expiresIn()));
  }

  private ResponseEntity<TokenPair> executeRequest(
      HttpEntity<MultiValueMap<String, String>> request) {
    log.debug("KeycloakAuthServiceImpl:: executeRequest called");
    try {
      ResponseEntity<KeycloakTokenResponse> tokenResponse =
          restTemplate.postForEntity(tokenUrl, request, KeycloakTokenResponse.class);
      if (!tokenResponse.getStatusCode().is2xxSuccessful()) {
        log.error(
            "KeycloakAuthServiceImpl:: failed to obtain tokens. Status code: {}",
            tokenResponse.getStatusCode());
        throw new RuntimeException("Failed to obtain tokens");
      }
      log.debug("KeycloakAuthServiceImpl:: successfully obtained tokens");
      assert tokenResponse.getBody() != null;
      return fromResponse(tokenResponse.getBody());
    } catch (Exception e) {
      log.error("KeycloakAuthServiceImpl:: failed to obtain tokens", e);
      throw new RuntimeException("Failed to obtain tokens: " + e.getMessage());
    }
  }
}
