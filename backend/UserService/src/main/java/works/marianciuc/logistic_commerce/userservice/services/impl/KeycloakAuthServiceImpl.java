package works.marianciuc.logistic_commerce.userservice.services.impl;

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

  private final String tokenUrl =
      String.format("%s/realms/%s/protocol/openid-connect/token", authServerUrl, realm);

  @Value("${keycloak.admin.client-id}")
  private String clientId;

  @Value("${keycloak.admin.client-secret}")
  private String clientSecret;

  public KeycloakAuthServiceImpl(RestTemplate restTemplate) {
    log.debug("KeycloakAuthServiceImpl created. Actual tokenUrl: {}", tokenUrl);
    this.restTemplate = restTemplate;
    this.headers = new HttpHeaders();
    this.headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
  }

  @Override
  public TokenPair login(String username, String password) {
    log.debug("KeycloakAuthServiceImpl login called");
    MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
    body.add(OAuth2Constants.GRANT_TYPE, OAuth2Constants.PASSWORD);
    body.add(OAuth2Constants.CLIENT_ID, clientId);
    body.add(OAuth2Constants.CLIENT_SECRET, clientSecret);
    body.add(OAuth2Constants.USERNAME, username);
    body.add(OAuth2Constants.PASSWORD, password);
    body.add(OAuth2Constants.SCOPE, "openid");

    HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
    return executeRequest(request);
  }

  @Override
  public TokenPair refresh(String refreshToken) {
    log.debug("KeycloakAuthServiceImpl refresh called");
    MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
    body.add(OAuth2Constants.GRANT_TYPE, OAuth2Constants.REFRESH_TOKEN);
    body.add(OAuth2Constants.CLIENT_ID, clientId);
    body.add(OAuth2Constants.CLIENT_SECRET, clientSecret);
    body.add(OAuth2Constants.REFRESH_TOKEN, refreshToken);

    HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
    return executeRequest(request);
  }

  private TokenPair fromResponse(KeycloakTokenResponse tokenResponse) {
    return new TokenPair(
        tokenResponse.accessToken(), tokenResponse.refreshToken(), tokenResponse.expiresIn());
  }

  private TokenPair executeRequest(HttpEntity<MultiValueMap<String, String>> request) {
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
      return fromResponse(tokenResponse.getBody());
    } catch (Exception e) {
      log.error("KeycloakAuthServiceImpl:: failed to obtain tokens", e);
      throw new RuntimeException("Failed to obtain tokens: " + e.getMessage());
    }
  }
}
