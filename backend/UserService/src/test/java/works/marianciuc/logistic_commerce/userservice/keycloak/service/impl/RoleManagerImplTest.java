package works.marianciuc.logistic_commerce.userservice.keycloak.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

import java.util.HashSet;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.RoleResource;
import org.keycloak.admin.client.resource.RolesResource;
import org.keycloak.representations.idm.RoleRepresentation;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import works.marianciuc.logistic_commerce.userservice.domain.enums.Role;
import works.marianciuc.logistic_commerce.userservice.domain.enums.SecurityScope;
import works.marianciuc.logistic_commerce.userservice.keycloak.config.KeycloakProperties;

@ExtendWith(MockitoExtension.class)
@DisplayName("RoleManagerImpl Tests")
class RoleManagerImplTest {

  private final String testRealmName = "test-realm";
  @Mock private Keycloak keycloak;
  @Mock private KeycloakProperties keycloakProperties;
  @Mock private KeycloakProperties.ClientConfig clientConfig;
  @Mock private RealmResource realmResource;
  @Mock private RolesResource rolesResource;
  @Mock private RoleResource roleResource;
  private RoleManagerImpl roleManager;

  @BeforeEach
  void setUp() {
    // Setup KeycloakProperties mock with lenient stubbing
    lenient().when(keycloakProperties.getDefaultClient()).thenReturn(clientConfig);
    lenient().when(clientConfig.getRealm()).thenReturn(testRealmName);

    // Create RoleManagerImpl with mocks
    roleManager = new RoleManagerImpl(keycloakProperties, keycloak);

    // Setup mock chain with lenient stubbing to avoid UnnecessaryStubbingException
    lenient().when(keycloak.realm(testRealmName)).thenReturn(realmResource);
    lenient().when(realmResource.roles()).thenReturn(rolesResource);
    lenient().when(rolesResource.get(anyString())).thenReturn(roleResource);
  }

  @Test
  @DisplayName("Should create scope successfully when scope does not exist")
  void shouldCreateScope_WhenScopeDoesNotExist() {
    // Arrange
    SecurityScope testScope = SecurityScope.MOD_001_001;
    when(roleResource.toRepresentation()).thenThrow(new RuntimeException("Role not found"));

    // Act & Assert
    assertDoesNotThrow(() -> roleManager.createScope(testScope));

    // Verify that create was called
    verify(rolesResource).create(any(RoleRepresentation.class));
  }

  @Test
  @DisplayName("Should not create scope when scope already exists")
  void shouldNotCreateScope_WhenScopeAlreadyExists() {
    // Arrange
    SecurityScope testScope = SecurityScope.MOD_001_001;
    RoleRepresentation existingRole = new RoleRepresentation();
    existingRole.setName(testScope.name());
    when(roleResource.toRepresentation()).thenReturn(existingRole);

    // Act & Assert
    assertDoesNotThrow(() -> roleManager.createScope(testScope));

    // Verify that create was NOT called
    verify(rolesResource, never()).create(any(RoleRepresentation.class));
  }

  @Test
  @DisplayName("Should update scope successfully when scope exists")
  void shouldUpdateScope_WhenScopeExists() {
    // Arrange
    SecurityScope testScope = SecurityScope.MOD_001_001;
    RoleRepresentation existingRole = new RoleRepresentation();
    existingRole.setName(testScope.name());
    existingRole.setDescription("Old description");
    when(roleResource.toRepresentation()).thenReturn(existingRole);

    // Act & Assert
    assertDoesNotThrow(() -> roleManager.updateScope(testScope));

    // Verify that update was called
    verify(roleResource).update(any(RoleRepresentation.class));
  }

  @Test
  @DisplayName("Should create role successfully when role does not exist")
  void shouldCreateRole_WhenRoleDoesNotExist() {
    // Arrange
    Role testRole = Role.DRIVER;
    RoleRepresentation createdRole = new RoleRepresentation();
    createdRole.setName(testRole.name());

    // First call throws exception (role doesn't exist), subsequent calls return the created role
    when(roleResource.toRepresentation())
        .thenThrow(new RuntimeException("Role not found"))
        .thenReturn(createdRole);
    when(roleResource.getRealmRoleComposites()).thenReturn(new HashSet<>());

    // Act & Assert
    assertDoesNotThrow(() -> roleManager.createRole(testRole));

    // Verify that create was called
    verify(rolesResource, atLeastOnce()).create(any(RoleRepresentation.class));
  }

  @Test
  @DisplayName("Should update role successfully when role exists")
  void shouldUpdateRole_WhenRoleExists() {
    // Arrange
    Role testRole = Role.DRIVER;
    RoleRepresentation existingRole = new RoleRepresentation();
    existingRole.setName(testRole.name());
    when(roleResource.toRepresentation()).thenReturn(existingRole);
    when(roleResource.getRealmRoleComposites()).thenReturn(new HashSet<>());

    // Act & Assert
    assertDoesNotThrow(() -> roleManager.updateRole(testRole));

    // Verify that update was called
    verify(roleResource, atLeastOnce()).update(any(RoleRepresentation.class));
  }

  @Test
  @DisplayName("Should validate and fix role-to-scope association")
  void shouldValidateAndFixRoleToScopeAssociation() {
    // Arrange
    Role testRole = Role.DRIVER;
    RoleRepresentation existingRole = new RoleRepresentation();
    existingRole.setName(testRole.name());
    when(roleResource.toRepresentation()).thenReturn(existingRole);
    when(roleResource.getRealmRoleComposites()).thenReturn(new HashSet<>());

    // Act & Assert
    assertDoesNotThrow(() -> roleManager.validateAndFixRoleToScopeAssociation(testRole));

    // Verify that the method completed without throwing exceptions
    verify(roleResource).getRealmRoleComposites();
  }

  @Test
  @DisplayName("Should handle exceptions gracefully")
  void shouldHandleExceptionsGracefully() {
    // Arrange
    SecurityScope testScope = SecurityScope.MOD_001_001;
    when(keycloak.realm(testRealmName)).thenThrow(new RuntimeException("Keycloak error"));

    // Act & Assert
    assertThrows(RuntimeException.class, () -> roleManager.createScope(testScope));
  }

  @Test
  @DisplayName("Should verify RoleManager implements both interfaces")
  void shouldImplementBothInterfaces() {
    // This test doesn't need any mocks or setup, just verify the class implements the interfaces
    Class<?> clazz = RoleManagerImpl.class;

    // Assert
    assertTrue(
        works.marianciuc.logistic_commerce.userservice.keycloak.service.RoleManager.class
            .isAssignableFrom(clazz));
    assertTrue(
        works.marianciuc.logistic_commerce.userservice.keycloak.service.ScopeManager.class
            .isAssignableFrom(clazz));
  }
}
