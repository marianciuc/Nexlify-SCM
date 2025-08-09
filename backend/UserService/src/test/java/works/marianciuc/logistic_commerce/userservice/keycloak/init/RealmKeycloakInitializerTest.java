package works.marianciuc.logistic_commerce.userservice.keycloak.init;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.*;
import org.keycloak.representations.idm.*;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import works.marianciuc.logistic_commerce.userservice.keycloak.config.KeycloakProperties;
import works.marianciuc.logistic_commerce.userservice.keycloak.service.ClientManager;
import works.marianciuc.logistic_commerce.userservice.keycloak.service.RealmManager;
import works.marianciuc.logistic_commerce.userservice.keycloak.service.UserManager;

@ExtendWith(MockitoExtension.class)
class RealmKeycloakInitializerTest {

  private static final String TEST_REALM = "test-realm";
  private static final String ADMIN_USERNAME = "admin";
  private static final String ADMIN_PASSWORD = "admin";
  private static final String ADMIN_EMAIL = "admin@example.com";
  private static final String ADMIN_FIRST_NAME = "System";
  private static final String ADMIN_LAST_NAME = "Administrator";
  @Mock private Keycloak keycloak;
  @Mock private RealmManager realmManager;
  @Mock private ClientManager clientManager;
  @Mock private UserManager userManager;
  @Mock private KeycloakProperties keycloakProperties;
  @Mock private KeycloakProperties.InitializationConfig initializationConfig;
  @Mock private KeycloakProperties.ClientConfig clientConfig;
  @Mock private KeycloakProperties.InitializationConfig.AdminAccountConfig adminAccountConfig;
  @Mock private RealmsResource realmsResource;
  @Mock private RealmResource realmResource;
  private RealmKeycloakInitializer initializer;

  @BeforeEach
  void setUp() {
    // Setup KeycloakProperties mocks with lenient stubbing
    lenient().when(keycloakProperties.getInitialization()).thenReturn(initializationConfig);
    lenient().when(keycloakProperties.getDefaultClient()).thenReturn(clientConfig);
    lenient().when(initializationConfig.getAdminAccount()).thenReturn(adminAccountConfig);
    lenient().when(clientConfig.getRealm()).thenReturn(TEST_REALM);

    // Setup admin account config with lenient stubbing
    lenient().when(adminAccountConfig.getUsername()).thenReturn(ADMIN_USERNAME);
    lenient().when(adminAccountConfig.getPassword()).thenReturn(ADMIN_PASSWORD);
    lenient().when(adminAccountConfig.getEmail()).thenReturn(ADMIN_EMAIL);
    lenient().when(adminAccountConfig.getFirstName()).thenReturn(ADMIN_FIRST_NAME);
    lenient().when(adminAccountConfig.getLastName()).thenReturn(ADMIN_LAST_NAME);

    // Setup Keycloak mocks with lenient stubbing
    lenient().when(keycloak.realms()).thenReturn(realmsResource);
    lenient().when(keycloak.realm(anyString())).thenReturn(realmResource);

    // Create initializer with mocks
    initializer =
        new RealmKeycloakInitializer(
            keycloakProperties, realmManager, clientManager, userManager, keycloak);
  }

  @Test
  @DisplayName("Should create realm when it does not exist")
  void shouldCreateRealm_WhenRealmDoesNotExist() {
    // Arrange
    lenient().when(initializationConfig.isEnableRealmInitialization()).thenReturn(true);
    lenient()
        .when(realmResource.toRepresentation())
        .thenThrow(new RuntimeException("Realm not found"));

    // Mock successful admin account creation
    lenient()
        .when(
            userManager.createAdminAccount(
                eq(ADMIN_USERNAME),
                eq(ADMIN_EMAIL),
                eq(ADMIN_FIRST_NAME),
                eq(ADMIN_LAST_NAME),
                eq(ADMIN_PASSWORD)))
        .thenReturn("admin-user-id");

    // Act
    initializer.initRealm();

    // Assert
    verify(realmManager).createRealm(TEST_REALM);
    verify(clientManager).createClient();
    verify(userManager)
        .createAdminAccount(
            eq(ADMIN_USERNAME),
            eq(ADMIN_EMAIL),
            eq(ADMIN_FIRST_NAME),
            eq(ADMIN_LAST_NAME),
            eq(ADMIN_PASSWORD));
  }

  @Test
  @DisplayName("Should not create realm when it already exists")
  void shouldNotCreateRealm_WhenRealmAlreadyExists() {
    // Arrange
    lenient().when(initializationConfig.isEnableRealmInitialization()).thenReturn(true);
    lenient().when(realmResource.toRepresentation()).thenReturn(new RealmRepresentation());

    // Mock successful admin account check
    lenient()
        .when(
            userManager.ensureAdminAccountExists(
                eq(ADMIN_USERNAME),
                eq(ADMIN_EMAIL),
                eq(ADMIN_FIRST_NAME),
                eq(ADMIN_LAST_NAME),
                eq(ADMIN_PASSWORD)))
        .thenReturn("admin-user-id");

    // Act
    initializer.initRealm();

    // Assert
    verify(realmManager, never()).createRealm(anyString());
    verify(clientManager, never()).createClient();
    verify(userManager)
        .ensureAdminAccountExists(
            eq(ADMIN_USERNAME),
            eq(ADMIN_EMAIL),
            eq(ADMIN_FIRST_NAME),
            eq(ADMIN_LAST_NAME),
            eq(ADMIN_PASSWORD));
  }

  @Test
  @DisplayName("Should not initialize realm when initialization is disabled")
  void shouldHandleRealmInitializationDisabled() {
    // Arrange
    lenient().when(initializationConfig.isEnableRealmInitialization()).thenReturn(false);

    // Act
    initializer.initRealm();

    // Assert
    verify(realmManager, never()).createRealm(anyString());
    verify(clientManager, never()).createClient();
    verify(userManager, never())
        .createAdminAccount(anyString(), anyString(), anyString(), anyString(), anyString());
    verify(userManager, never())
        .ensureAdminAccountExists(anyString(), anyString(), anyString(), anyString(), anyString());
  }

  @Test
  @DisplayName("Should handle exceptions gracefully during realm creation")
  void shouldHandleExceptionsGracefully_DuringRealmCreation() {
    // Arrange
    lenient().when(initializationConfig.isEnableRealmInitialization()).thenReturn(true);
    lenient()
        .when(realmResource.toRepresentation())
        .thenThrow(new RuntimeException("Realm not found"));
    doThrow(new RuntimeException("Failed to create realm"))
        .when(realmManager)
        .createRealm(anyString());

    // Act & Assert
    assertThrows(RuntimeException.class, () -> initializer.initRealm());
  }

  @Test
  @DisplayName("Should handle exceptions gracefully during admin account creation")
  void shouldHandleExceptionsGracefully_DuringAdminAccountCreation() {
    // Arrange
    lenient().when(initializationConfig.isEnableRealmInitialization()).thenReturn(true);
    lenient()
        .when(realmResource.toRepresentation())
        .thenThrow(new RuntimeException("Realm not found"));

    // Mock exception during admin account creation
    lenient()
        .when(
            userManager.createAdminAccount(
                anyString(), anyString(), anyString(), anyString(), anyString()))
        .thenThrow(new RuntimeException("Failed to create admin account"));

    // Act & Assert
    assertThrows(RuntimeException.class, () -> initializer.initRealm());
    verify(realmManager).createRealm(TEST_REALM);
    verify(clientManager).createClient();
  }
}
