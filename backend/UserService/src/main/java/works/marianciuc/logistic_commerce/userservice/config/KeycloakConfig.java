package works.marianciuc.logistic_commerce.userservice.config;

import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KeycloakConfig {

  @Value("${keycloak.admin.auth-server-url}")
  private String authServerUrl;

  @Value("${keycloak.admin.realm}")
  private String realm;

  @Value("${keycloak.admin.client-id}")
  private String clientId;

  @Value("${keycloak.admin.client-secret}")
  private String clientSecret;

  @Bean
  public Keycloak keycloak() {
    return KeycloakBuilder.builder()
        .serverUrl(authServerUrl)
        .realm(realm)
        .clientId(clientId)
        .clientSecret(clientSecret)
        .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
        .build();
  }
}
