package works.marianciuc.logistic_commerce.userservice.keycloak.init;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import works.marianciuc.logistic_commerce.userservice.domain.enums.Role;
import works.marianciuc.logistic_commerce.userservice.domain.enums.SecurityScope;
import works.marianciuc.logistic_commerce.userservice.keycloak.config.KeycloakProperties;
import works.marianciuc.logistic_commerce.userservice.keycloak.service.RoleManager;
import works.marianciuc.logistic_commerce.userservice.services.UserManagementService;

/**
 * Initializer for Keycloak roles and security scopes. Uses service classes and configuration
 * properties for initialization.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RoleKeycloakInitializer {

  private final KeycloakProperties keycloakProperties;
  private final RoleManager roleManager;
  private final UserManagementService userManagementService;

  /**
   * Initializes the Keycloak roles and security scopes when the application starts. This method is
   * triggered by the ApplicationReadyEvent.
   */
  @EventListener(ApplicationReadyEvent.class)
  public void onApplicationReady() {
    if (keycloakProperties.getInitialization().isEnableRoleInitialization()) {
      log.info("Role synchronization enabled, starting sync process...");

      try {
        // Step 1: Synchronize SecurityScope permissions (individual roles)
        synchronizeSecurityScopes();

        // Step 2: Synchronize Role enum values (composite roles)
        synchronizeSystemRoles();

        // Step 3: Validate role-scope correspondence
        validateRoleScopeCorrespondence();

        log.info("Role synchronization completed successfully");
      } catch (Exception e) {
        log.error("Error during role synchronization: {}", e.getMessage(), e);
        throw new RuntimeException("Role synchronization failed", e);
      }
    } else {
      log.debug("Role synchronization is disabled");
    }
  }

  /** Synchronizes SecurityScope permissions with Keycloak. */
  private void synchronizeSecurityScopes() {
    log.debug("Synchronizing SecurityScope permissions...");

    Set<SecurityScope> applicationScopes = getApplicationRoles();

    log.debug("Found {} SecurityScopes in application", applicationScopes.size());

    // Create or update all SecurityScope roles in Keycloak
    for (SecurityScope scope : applicationScopes) {
      try {
        // Use RoleManager to create or update the scope
        roleManager.createScope(scope);
        log.debug("Synchronized SecurityScope role: {}", scope.name());
      } catch (Exception e) {
        log.error("Error synchronizing SecurityScope '{}': {}", scope.name(), e.getMessage(), e);
        throw new RuntimeException("Failed to synchronize SecurityScope: " + scope.name(), e);
      }
    }

    log.info("SecurityScope synchronization completed");
  }

  /** Synchronizes system roles with Keycloak. */
  private void synchronizeSystemRoles() {
    log.debug("Synchronizing system Role enum values...");

    Set<Role> systemRoles = getSystemRoles();

    log.debug("Found {} system roles to synchronize", systemRoles.size());

    for (Role systemRole : systemRoles) {
      try {
        // Use RoleManager to create or update the role
        roleManager.createRole(systemRole);

        // Validate that the role has correct scope assignments
        roleManager.validateAndFixRoleToScopeAssociation(systemRole);

        log.debug("Synchronized system role: {}", systemRole.name());
      } catch (Exception e) {
        log.error("Error synchronizing system role '{}': {}", systemRole.name(), e.getMessage(), e);
        throw new RuntimeException("Failed to synchronize system role: " + systemRole.name(), e);
      }
    }

    log.info("System role synchronization completed");
  }

  /** Validates the correspondence between roles and scopes. */
  private void validateRoleScopeCorrespondence() {
    log.debug("Validating role-scope correspondence...");

    Set<Role> systemRoles = getSystemRoles();

    for (Role systemRole : systemRoles) {
      try {
        // Use RoleManager to validate and fix role-to-scope associations
        roleManager.validateAndFixRoleToScopeAssociation(systemRole);
        log.debug("Validated role-scope correspondence for role: {}", systemRole.name());
      } catch (Exception e) {
        log.error(
            "Error validating role-scope correspondence for role '{}': {}",
            systemRole.name(),
            e.getMessage(),
            e);
        throw new RuntimeException(
            "Failed to validate role-scope correspondence for role: " + systemRole.name(), e);
      }
    }

    log.info("Role-scope correspondence validation completed");
  }

  /**
   * Gets all system roles from the Role enum.
   *
   * @return A set of all system roles
   */
  private Set<Role> getSystemRoles() {
    return Arrays.stream(Role.values()).collect(Collectors.toSet());
  }

  /**
   * Gets all application roles from the SecurityScope enum.
   *
   * @return A set of all application roles
   */
  private Set<SecurityScope> getApplicationRoles() {
    return Arrays.stream(SecurityScope.values()).collect(Collectors.toSet());
  }
}
