package works.marianciuc.logistic_commerce.userservice.keycloak.service.impl;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.RoleRepresentation;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import works.marianciuc.logistic_commerce.userservice.domain.enums.Role;
import works.marianciuc.logistic_commerce.userservice.domain.enums.SecurityScope;
import works.marianciuc.logistic_commerce.userservice.keycloak.config.KeycloakProperties;
import works.marianciuc.logistic_commerce.userservice.keycloak.service.RoleManager;
import works.marianciuc.logistic_commerce.userservice.keycloak.service.ScopeManager;

@Service
@Slf4j
public class RoleManagerImpl implements RoleManager, ScopeManager {

  private final KeycloakProperties keycloakProperties;
  private final Keycloak keycloak;

  public RoleManagerImpl(
      KeycloakProperties keycloakProperties, @Qualifier("adminKeycloak") Keycloak keycloak) {
    this.keycloakProperties = keycloakProperties;
    this.keycloak = keycloak;
  }

  private String getRealmName() {
    return keycloakProperties.getDefaultClient().getRealm();
  }

  @Override
  public void createRole(Role role) {
    try {
      log.debug("Creating role '{}' in realm '{}'", role.name(), getRealmName());

      if (roleExists(role.name())) {
        log.info("Role '{}' already exists in realm '{}'", role.name(), getRealmName());
        return;
      }

      RoleRepresentation roleRepresentation = new RoleRepresentation();
      roleRepresentation.setName(role.name());
      roleRepresentation.setDescription("Role: " + role.name());

      keycloak.realm(getRealmName()).roles().create(roleRepresentation);
      log.info("Role '{}' created successfully in realm '{}'", role.name(), getRealmName());

      validateAndFixRoleToScopeAssociation(role);

    } catch (Exception e) {
      log.error(
          "Error while creating role '{}' in realm '{}': {}",
          role.name(),
          getRealmName(),
          e.getMessage());
      throw new RuntimeException("Failed to create role", e);
    }
  }

  @Override
  public void updateRole(Role role) {
    try {
      log.debug("Updating role '{}' in realm '{}'", role.name(), getRealmName());
      if (!roleExists(role.name())) {
        log.warn(
            "Role '{}' does not exist in realm '{}', creating it", role.name(), getRealmName());
        createRole(role);
        return;
      }

      RoleRepresentation roleRepresentation =
          keycloak.realm(getRealmName()).roles().get(role.name()).toRepresentation();
      roleRepresentation.setDescription("Role: " + role.name());
      keycloak.realm(getRealmName()).roles().get(role.name()).update(roleRepresentation);

      validateAndFixRoleToScopeAssociation(role);
      log.info("Role '{}' updated successfully in realm '{}'", role.name(), getRealmName());
    } catch (Exception e) {
      log.error(
          "Error while updating role '{}' in realm '{}': {}",
          role.name(),
          getRealmName(),
          e.getMessage());
      throw new RuntimeException("Failed to update role", e);
    }
  }

  @Override
  public void validateAndFixRoleToScopeAssociation(Role role) {
    try {
      log.debug(
          "Validating and fixing role-to-scope association for role '{}' in realm '{}'",
          role.name(),
          getRealmName());

      for (SecurityScope scope : role.getSecurityPossibilities()) {
        if (!scopeExists(scope.name())) {
          log.debug("Scope '{}' does not exist, creating it", scope.name());
          createScope(scope);
        }
      }

      Set<RoleRepresentation> currentComposites =
          keycloak.realm(getRealmName()).roles().get(role.name()).getRealmRoleComposites();

      Set<String> currentScopeNames =
          currentComposites.stream().map(RoleRepresentation::getName).collect(Collectors.toSet());

      Set<String> requiredScopeNames =
          role.getSecurityPossibilities().stream()
              .map(SecurityScope::name)
              .collect(Collectors.toSet());

      Set<String> scopesToAdd =
          requiredScopeNames.stream()
              .filter(scopeName -> !currentScopeNames.contains(scopeName))
              .collect(Collectors.toSet());

      if (!scopesToAdd.isEmpty()) {
        List<RoleRepresentation> scopesToAddRepresentations =
            scopesToAdd.stream()
                .map(
                    scopeName ->
                        keycloak.realm(getRealmName()).roles().get(scopeName).toRepresentation())
                .collect(Collectors.toList());

        keycloak
            .realm(getRealmName())
            .roles()
            .get(role.name())
            .addComposites(scopesToAddRepresentations);
        log.debug("Added {} scopes to role '{}': {}", scopesToAdd.size(), role.name(), scopesToAdd);
      }

      Set<String> scopesToRemove =
          currentScopeNames.stream()
              .filter(scopeName -> !requiredScopeNames.contains(scopeName))
              .collect(Collectors.toSet());

      if (!scopesToRemove.isEmpty()) {
        List<RoleRepresentation> scopesToRemoveRepresentations =
            scopesToRemove.stream()
                .map(
                    scopeName ->
                        keycloak.realm(getRealmName()).roles().get(scopeName).toRepresentation())
                .collect(Collectors.toList());

        keycloak
            .realm(getRealmName())
            .roles()
            .get(role.name())
            .deleteComposites(scopesToRemoveRepresentations);
        log.debug(
            "Removed {} scopes from role '{}': {}",
            scopesToRemove.size(),
            role.name(),
            scopesToRemove);
      }

      log.info(
          "Role-to-scope association validated and fixed for role '{}' in realm '{}'",
          role.name(),
          getRealmName());

    } catch (Exception e) {
      log.error(
          "Error while validating role-to-scope association for role '{}' in realm '{}': {}",
          role.name(),
          getRealmName(),
          e.getMessage());
      throw new RuntimeException("Failed to validate and fix role-to-scope association", e);
    }
  }

  @Override
  public boolean validateRole(String roleName) {
    if (roleExists(roleName)) return true;

    createRole(Role.valueOf(roleName));
    validateAndFixRoleToScopeAssociation(Role.valueOf(roleName));
    return true;
  }

  @Override
  public void createScope(SecurityScope scope) {
    try {
      log.debug("Creating scope '{}' in realm '{}'", scope.name(), getRealmName());

      if (scopeExists(scope.name())) {
        log.info("Scope '{}' already exists in realm '{}'", scope.name(), getRealmName());
        return;
      }
      RoleRepresentation scopeRepresentation = new RoleRepresentation();
      scopeRepresentation.setName(scope.name());
      scopeRepresentation.setDescription(scope.getDescription());

      keycloak.realm(getRealmName()).roles().create(scopeRepresentation);
      log.info("Scope '{}' created successfully in realm '{}'", scope.name(), getRealmName());

    } catch (Exception e) {
      log.error(
          "Error while creating scope '{}' in realm '{}': {}",
          scope.name(),
          getRealmName(),
          e.getMessage());
      throw new RuntimeException("Failed to create scope", e);
    }
  }

  @Override
  public void updateScope(SecurityScope scope) {
    try {
      log.debug("Updating scope '{}' in realm '{}'", scope.name(), getRealmName());

      if (!scopeExists(scope.name())) {
        log.warn(
            "Scope '{}' does not exist in realm '{}', creating it", scope.name(), getRealmName());
        createScope(scope);
        return;
      }

      RoleRepresentation scopeRepresentation =
          keycloak.realm(getRealmName()).roles().get(scope.name()).toRepresentation();
      scopeRepresentation.setDescription(scope.getDescription());
      keycloak.realm(getRealmName()).roles().get(scope.name()).update(scopeRepresentation);

      log.info("Scope '{}' updated successfully in realm '{}'", scope.name(), getRealmName());

    } catch (Exception e) {
      log.error(
          "Error while updating scope '{}' in realm '{}': {}",
          scope.name(),
          getRealmName(),
          e.getMessage());
      throw new RuntimeException("Failed to update scope", e);
    }
  }

  private boolean roleExists(String roleName) {
    try {
      keycloak.realm(getRealmName()).roles().get(roleName).toRepresentation();
      return true;
    } catch (Exception e) {
      return false;
    }
  }

  private boolean scopeExists(String scopeName) {
    return roleExists(scopeName);
  }
}
