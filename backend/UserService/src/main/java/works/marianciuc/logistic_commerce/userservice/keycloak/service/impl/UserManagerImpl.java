package works.marianciuc.logistic_commerce.userservice.keycloak.service.impl;

import jakarta.ws.rs.core.Response;
import java.util.Collections;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import works.marianciuc.logistic_commerce.userservice.keycloak.config.KeycloakProperties;
import works.marianciuc.logistic_commerce.userservice.keycloak.exception.KeycloakOperationException;
import works.marianciuc.logistic_commerce.userservice.keycloak.exception.KeycloakUserAlreadyExistsException;
import works.marianciuc.logistic_commerce.userservice.keycloak.service.RoleManager;
import works.marianciuc.logistic_commerce.userservice.keycloak.service.UserManager;

/** Implementation of the UserManager interface for managing users in Keycloak. */
@Slf4j
@Service
public class UserManagerImpl implements UserManager {

  private static final String USER_ALREADY_EXISTS_EXCEPTION =
      "User with provided username already exists: %s";

  private final Keycloak keycloak;
  private final KeycloakProperties keycloakProperties;
  private final RoleManager roleManager;

  public UserManagerImpl(
      @Qualifier("adminKeycloak") Keycloak keycloak,
      KeycloakProperties keycloakProperties,
      RoleManager roleManager) {
    this.keycloak = keycloak;
    this.keycloakProperties = keycloakProperties;
    this.roleManager = roleManager;
  }

  @Override
  public String createUser(
      String username,
      String email,
      String firstName,
      String lastName,
      String password,
      boolean isEnabled,
      boolean isEmailVerified,
      String id) {
    if (userExists(username)) {
      log.error("User '{}' already exists", username);
      throw new KeycloakUserAlreadyExistsException(
          String.format(USER_ALREADY_EXISTS_EXCEPTION, username));
    }
    String realmName = keycloakProperties.getDefaultClient().getRealm();

    UserRepresentation user = new UserRepresentation();
    user.setId(id);
    user.setUsername(username);
    user.setEmail(email);
    user.setFirstName(firstName);
    user.setLastName(lastName);
    user.setEnabled(isEnabled);
    user.setEmailVerified(isEmailVerified);

    UsersResource usersResource = keycloak.realm(realmName).users();

    try (Response response = usersResource.create(user)) {
      log.info("User '{}' creation initiated", username);
      String userId = extractUserIdFromResponse(response);

      if (userId == null) userId = getUserIdByUsername(username);
      if (userId == null)
        throw new KeycloakOperationException(
            "Failed to create new user", "Failed to extract user ID");

      setUserPassword(userId, password, false);
      log.info("User '{}' created successfully with ID: {}", username, userId);
      return userId;
    } catch (Exception e) {
      throw new RuntimeException("Failed to create user", e);
    }
  }

  @Override
  public boolean userExists(String username) {
    try {
      return getUserByUsername(username) != null;
    } catch (Exception e) {
      log.error("Error checking if user exists: {}", e.getMessage(), e);
      return false;
    }
  }

  @Override
  public UserRepresentation getUserByUsername(String username) {
    try {
      String realmName = keycloakProperties.getDefaultClient().getRealm();
      return keycloak.realm(realmName).users().searchByUsername(username, true).getFirst();
    } catch (Exception e) {
      log.error("Error getting user by username '{}': {}", username, e.getMessage(), e);
      return null;
    }
  }

  @Override
  public String getUserIdByUsername(String username) {
    try {
      UserRepresentation user = getUserByUsername(username);
      return user != null ? user.getId() : null;
    } catch (Exception e) {
      log.error("Error getting user ID for username '{}': {}", username, e.getMessage(), e);
      return null;
    }
  }

  @Override
  public void setUserPassword(String userId, String password, boolean isTemporary) {
    try {
      String realmName = keycloakProperties.getDefaultClient().getRealm();
      CredentialRepresentation credential = new CredentialRepresentation();
      credential.setType(CredentialRepresentation.PASSWORD);
      credential.setValue(password);
      credential.setTemporary(isTemporary);

      keycloak.realm(realmName).users().get(userId).resetPassword(credential);
      log.info("Password set for user ID: {}", userId);
    } catch (Exception e) {
      log.error("Error setting password for user ID '{}': {}", userId, e.getMessage(), e);
      throw new RuntimeException("Failed to set user password", e);
    }
  }

  @Override
  public void assignRoleToUser(String userId, String roleName) {
    try {
      String realmName = keycloakProperties.getDefaultClient().getRealm();
      roleManager.validateRole(roleName);

      RoleRepresentation role = keycloak.realm(realmName).roles().get(roleName).toRepresentation();

      keycloak
          .realm(realmName)
          .users()
          .get(userId)
          .roles()
          .realmLevel()
          .add(Collections.singletonList(role));

      log.info("Assigned role '{}' to user ID: {}", roleName, userId);
    } catch (Exception e) {
      log.error(
          "Error assigning role '{}' to user ID '{}': {}", roleName, userId, e.getMessage(), e);
      throw new RuntimeException("Failed to assign role to user", e);
    }
  }

  @Override
  public boolean userHasRole(String userId, String roleName) {
    try {
      String realmName = keycloakProperties.getDefaultClient().getRealm();

      List<RoleRepresentation> userRoles =
          keycloak.realm(realmName).users().get(userId).roles().realmLevel().listAll();

      return userRoles.stream().anyMatch(role -> roleName.equals(role.getName()));
    } catch (Exception e) {
      log.error("Error checking if user has role: {}", e.getMessage(), e);
      return false;
    }
  }

  private String extractUserIdFromResponse(Response response) {
    try {
      String location = response.getHeaderString("Location");
      if (location != null && location.contains("/users/")) {
        return location.substring(location.lastIndexOf("/") + 1);
      }
    } catch (Exception e) {
      log.debug("Failed to extract user ID from response header: {}", e.getMessage());
    }
    return null;
  }
}
