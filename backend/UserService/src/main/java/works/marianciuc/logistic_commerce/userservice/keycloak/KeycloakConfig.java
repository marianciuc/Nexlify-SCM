package works.marianciuc.logistic_commerce.userservice.keycloak;

import lombok.extern.slf4j.Slf4j;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Slf4j
@Configuration
public class KeycloakConfig {

  @Value("${keycloak.server-url}")
  private String serverUrl;

  @Bean("realmKeycloak")
  @Primary
  public Keycloak realmKeycloak(
      @Value("${keycloak.default-client.realm}") String realm,
      @Value("${keycloak.default-client.client-id}") String clientId,
      @Value("${keycloak.default-client.client-secret}") String clientSecret) {
    return KeycloakBuilder.builder()
        .serverUrl(serverUrl)
        .realm(realm)
        .clientId(clientId)
        .clientSecret(clientSecret)
        .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
        .build();
  }

  @Bean("adminKeycloak")
  public Keycloak adminKeycloak(
      @Value("${keycloak.admin.realm}") String realm,
      @Value("${keycloak.admin.client-id}") String clientId,
      @Value("${keycloak.admin.username}") String username,
      @Value("${keycloak.admin.password}") String password) {

    // Validate admin credentials and provide helpful error messages
    validateAdminCredentials(username, password);

    try {
      Keycloak keycloak =
          KeycloakBuilder.builder()
              .serverUrl(serverUrl)
              .realm(realm)
              .clientId(clientId)
              .username(username)
              .password(password)
              .grantType(OAuth2Constants.PASSWORD)
              .build();

      // Test the connection by attempting to get server info
      testKeycloakConnection(keycloak, username);

      return keycloak;
    } catch (Exception e) {
      handleKeycloakConnectionError(e, username, password);
      throw e; // Re-throw to prevent application startup
    }
  }

  private void validateAdminCredentials(String username, String password) {
    if ("admin".equals(username) && "admin".equals(password)) {
      log.warn(
          "Using default Keycloak admin credentials (admin/admin). "
              + "For production environments, please set the following environment variables:");
      log.warn("  KEYCLOAK_ADMIN_USERNAME=<your-keycloak-admin-username>");
      log.warn("  KEYCLOAK_ADMIN_PASSWORD=<your-keycloak-admin-password>");
      log.warn(
          "Make sure your Keycloak server has an admin user with these credentials in the 'master' realm.");
    }
  }

  private void testKeycloakConnection(Keycloak keycloak, String username) {
    try {
      log.debug("Testing Keycloak admin connection for user: {}", username);
      // Attempt to get server info to test the connection
      keycloak.serverInfo().getInfo();
      log.info("Successfully connected to Keycloak server with admin user: {}", username);
    } catch (Exception e) {
      log.error("Failed to connect to Keycloak server with admin user: {}", username);
      throw e;
    }
  }

  private void handleKeycloakConnectionError(Exception e, String username, String password) {
    log.error("Failed to create Keycloak admin client. Error: {}", e.getMessage());

    if (e.getMessage() != null && e.getMessage().contains("401")) {
      log.error("Authentication failed for Keycloak admin user: {}", username);
      log.error("This usually means:");
      log.error("1. The Keycloak server is not running on: {}", serverUrl);
      log.error("2. The admin credentials are incorrect");
      log.error("3. The admin user doesn't exist in the 'master' realm");
      log.error("");
      log.error("To fix this issue:");
      log.error("1. Ensure Keycloak server is running on: {}", serverUrl);
      log.error("2. Create an admin user in Keycloak's 'master' realm");
      log.error("3. Set the correct credentials using environment variables:");
      log.error("   KEYCLOAK_ADMIN_USERNAME=<your-admin-username>");
      log.error("   KEYCLOAK_ADMIN_PASSWORD=<your-admin-password>");

      if ("admin".equals(username) && "admin".equals(password)) {
        log.error("");
        log.error("You are using default credentials (admin/admin). ");
        log.error(
            "Make sure your Keycloak server has an admin user with username 'admin' and password 'admin' in the 'master' realm,");
        log.error(
            "or set the KEYCLOAK_ADMIN_USERNAME and KEYCLOAK_ADMIN_PASSWORD environment variables to match your actual admin credentials.");
      }
    } else {
      log.error("Connection error to Keycloak server at: {}", serverUrl);
      log.error("Please verify that the Keycloak server is running and accessible.");
    }
  }
}
