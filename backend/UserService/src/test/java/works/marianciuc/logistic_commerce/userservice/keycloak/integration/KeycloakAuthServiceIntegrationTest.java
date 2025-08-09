package works.marianciuc.logistic_commerce.userservice.keycloak.integration;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import works.marianciuc.logistic_commerce.userservice.domain.dto.TokenPair;
import works.marianciuc.logistic_commerce.userservice.services.AuthService;

/**
 * Integration tests for Keycloak authentication service. These tests require a running Keycloak
 * instance and proper configuration.
 *
 * <p>To run these tests: 1. Start Keycloak server on localhost:9090 2. Set environment variable
 * KEYCLOAK_INTEGRATION_TESTS=true 3. Ensure test realm and users are configured
 */
@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(
    properties = {
      "keycloak.server-url=http://localhost:9090",
      "keycloak.default-client.realm=LogisticCommerce",
      "keycloak.default-client.client-id=application-client",
      "keycloak.default-client.client-secret=test-secret",
      "logging.level.works.marianciuc.logistic_commerce.userservice.keycloak=DEBUG"
    })
@EnabledIfEnvironmentVariable(named = "KEYCLOAK_INTEGRATION_TESTS", matches = "true")
@DisplayName("Keycloak Authentication Service Integration Tests")
class KeycloakAuthServiceIntegrationTest {

  private static final String TEST_USERNAME = "testuser";
  private static final String TEST_PASSWORD = "TestPassword123!";
  private static final String INVALID_USERNAME = "nonexistentuser";
  private static final String INVALID_PASSWORD = "wrongpassword";
  @Autowired private AuthService authService;

  @BeforeEach
  void setUp() {
    assertNotNull(authService, "AuthService should be autowired");
    System.out.println("[DEBUG_LOG] Starting Keycloak authentication integration test");
  }

  @Test
  @DisplayName("Should successfully authenticate valid user credentials")
  void shouldAuthenticateValidCredentials() {
    System.out.println("[DEBUG_LOG] Testing valid user authentication");

    // Act
    ResponseEntity<TokenPair> response = authService.login(TEST_USERNAME, TEST_PASSWORD);

    // Assert
    assertNotNull(response, "Response should not be null");
    assertTrue(response.getStatusCode().is2xxSuccessful(), "Response should be successful");

    TokenPair tokenPair = response.getBody();
    assertNotNull(tokenPair, "Token pair should not be null");
    assertNotNull(tokenPair.accessToken(), "Access token should not be null");
    assertNotNull(tokenPair.refreshToken(), "Refresh token should not be null");
    assertTrue(tokenPair.accessExpiresIn() > 0, "Expires in should be positive");

    System.out.println("[DEBUG_LOG] Successfully authenticated user: " + TEST_USERNAME);
    System.out.println("[DEBUG_LOG] Access token length: " + tokenPair.accessToken().length());
    System.out.println("[DEBUG_LOG] Refresh token length: " + tokenPair.refreshToken().length());
    System.out.println("[DEBUG_LOG] Expires in: " + tokenPair.accessExpiresIn() + " seconds");
  }

  @Test
  @DisplayName("Should fail authentication with invalid username")
  void shouldFailAuthenticationWithInvalidUsername() {
    System.out.println("[DEBUG_LOG] Testing authentication with invalid username");

    // Act & Assert
    assertThrows(
        RuntimeException.class,
        () -> {
          authService.login(INVALID_USERNAME, TEST_PASSWORD);
        },
        "Should throw exception for invalid username");

    System.out.println("[DEBUG_LOG] Correctly rejected invalid username: " + INVALID_USERNAME);
  }

  @Test
  @DisplayName("Should fail authentication with invalid password")
  void shouldFailAuthenticationWithInvalidPassword() {
    System.out.println("[DEBUG_LOG] Testing authentication with invalid password");

    // Act & Assert
    assertThrows(
        RuntimeException.class,
        () -> {
          authService.login(TEST_USERNAME, INVALID_PASSWORD);
        },
        "Should throw exception for invalid password");

    System.out.println(
        "[DEBUG_LOG] Correctly rejected invalid password for user: " + TEST_USERNAME);
  }

  @Test
  @DisplayName("Should fail authentication with null credentials")
  void shouldFailAuthenticationWithNullCredentials() {
    System.out.println("[DEBUG_LOG] Testing authentication with null credentials");

    // Act & Assert
    assertThrows(
        Exception.class,
        () -> {
          authService.login(null, null);
        },
        "Should throw exception for null credentials");

    assertThrows(
        Exception.class,
        () -> {
          authService.login(TEST_USERNAME, null);
        },
        "Should throw exception for null password");

    assertThrows(
        Exception.class,
        () -> {
          authService.login(null, TEST_PASSWORD);
        },
        "Should throw exception for null username");

    System.out.println("[DEBUG_LOG] Correctly rejected null credentials");
  }

  @Test
  @DisplayName("Should successfully refresh valid token")
  void shouldRefreshValidToken() {
    System.out.println("[DEBUG_LOG] Testing token refresh");

    // Arrange - First get a valid token
    ResponseEntity<TokenPair> loginResponse = authService.login(TEST_USERNAME, TEST_PASSWORD);
    assertNotNull(loginResponse.getBody(), "Login should succeed");

    String refreshToken = loginResponse.getBody().refreshToken();
    System.out.println("[DEBUG_LOG] Got refresh token for refresh test");

    // Act
    ResponseEntity<TokenPair> refreshResponse = authService.refresh(refreshToken);

    // Assert
    assertNotNull(refreshResponse, "Refresh response should not be null");
    assertTrue(refreshResponse.getStatusCode().is2xxSuccessful(), "Refresh should be successful");

    TokenPair newTokenPair = refreshResponse.getBody();
    assertNotNull(newTokenPair, "New token pair should not be null");
    assertNotNull(newTokenPair.accessToken(), "New access token should not be null");
    assertNotNull(newTokenPair.refreshToken(), "New refresh token should not be null");
    assertTrue(newTokenPair.accessExpiresIn() > 0, "New expires in should be positive");

    // Tokens should be different (new tokens issued)
    assertNotEquals(
        loginResponse.getBody().accessToken(),
        newTokenPair.accessToken(),
        "New access token should be different");

    System.out.println("[DEBUG_LOG] Successfully refreshed token");
    System.out.println(
        "[DEBUG_LOG] New access token length: " + newTokenPair.accessToken().length());
  }

  @Test
  @DisplayName("Should fail refresh with invalid token")
  void shouldFailRefreshWithInvalidToken() {
    System.out.println("[DEBUG_LOG] Testing refresh with invalid token");

    String invalidToken = "invalid.refresh.token";

    // Act & Assert
    assertThrows(
        RuntimeException.class,
        () -> {
          authService.refresh(invalidToken);
        },
        "Should throw exception for invalid refresh token");

    System.out.println("[DEBUG_LOG] Correctly rejected invalid refresh token");
  }

  @Test
  @DisplayName("Should successfully logout with valid token")
  void shouldLogoutWithValidToken() {
    System.out.println("[DEBUG_LOG] Testing logout");

    // Arrange - First get a valid token
    ResponseEntity<TokenPair> loginResponse = authService.login(TEST_USERNAME, TEST_PASSWORD);
    assertNotNull(loginResponse.getBody(), "Login should succeed");

    String refreshToken = loginResponse.getBody().refreshToken();
    System.out.println("[DEBUG_LOG] Got refresh token for logout test");

    // Act
    ResponseEntity<Void> logoutResponse = authService.logout(refreshToken);

    // Assert
    assertNotNull(logoutResponse, "Logout response should not be null");
    assertTrue(logoutResponse.getStatusCode().is2xxSuccessful(), "Logout should be successful");

    System.out.println("[DEBUG_LOG] Successfully logged out user");

    // Verify token is invalidated by trying to refresh
    assertThrows(
        RuntimeException.class,
        () -> {
          authService.refresh(refreshToken);
        },
        "Refresh should fail after logout");

    System.out.println("[DEBUG_LOG] Confirmed token was invalidated after logout");
  }

  @Test
  @DisplayName("Should handle logout with invalid token gracefully")
  void shouldHandleLogoutWithInvalidToken() {
    System.out.println("[DEBUG_LOG] Testing logout with invalid token");

    String invalidToken = "invalid.refresh.token";

    // Act & Assert - This might succeed or fail depending on Keycloak configuration
    // Some implementations return success even for invalid tokens
    try {
      ResponseEntity<Void> response = authService.logout(invalidToken);
      System.out.println(
          "[DEBUG_LOG] Logout with invalid token returned status: " + response.getStatusCode());
    } catch (RuntimeException e) {
      System.out.println(
          "[DEBUG_LOG] Logout with invalid token threw exception: " + e.getMessage());
      // This is also acceptable behavior
    }
  }

  @Test
  @DisplayName("Should handle empty credentials gracefully")
  void shouldHandleEmptyCredentials() {
    System.out.println("[DEBUG_LOG] Testing authentication with empty credentials");

    // Act & Assert
    assertThrows(
        Exception.class,
        () -> {
          authService.login("", "");
        },
        "Should throw exception for empty credentials");

    assertThrows(
        Exception.class,
        () -> {
          authService.login("   ", "   ");
        },
        "Should throw exception for whitespace-only credentials");

    System.out.println("[DEBUG_LOG] Correctly rejected empty credentials");
  }
}
