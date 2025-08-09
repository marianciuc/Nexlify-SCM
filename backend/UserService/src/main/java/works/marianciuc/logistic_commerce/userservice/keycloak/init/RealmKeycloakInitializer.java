package works.marianciuc.logistic_commerce.userservice.keycloak.init;

import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import works.marianciuc.logistic_commerce.userservice.domain.enums.Role;
import works.marianciuc.logistic_commerce.userservice.keycloak.config.KeycloakProperties;
import works.marianciuc.logistic_commerce.userservice.keycloak.service.ClientManager;
import works.marianciuc.logistic_commerce.userservice.keycloak.service.RealmManager;
import works.marianciuc.logistic_commerce.userservice.keycloak.service.UserManager;

/**
 * Initializer for Keycloak realm, client, and admin account. Uses service classes and configuration
 * properties for initialization.
 */
@Slf4j
@Component
public class RealmKeycloakInitializer {

  private final KeycloakProperties keycloakProperties;
  private final RealmManager realmManager;
  private final ClientManager clientManager;
  private final UserManager userManager;
  private final Keycloak keycloak;

  public RealmKeycloakInitializer(
      KeycloakProperties keycloakProperties,
      RealmManager realmManager,
      ClientManager clientManager,
      UserManager userManager,
      @Qualifier("adminKeycloak") Keycloak keycloak) {
    this.keycloakProperties = keycloakProperties;
    this.realmManager = realmManager;
    this.clientManager = clientManager;
    this.userManager = userManager;
    this.keycloak = keycloak;
  }

  @EventListener(ApplicationReadyEvent.class)
  public void initRealm() {
    if (keycloakProperties.getInitialization().isEnableRealmInitialization()) {
      String realmName = keycloakProperties.getDefaultClient().getRealm();
      log.info("Realm initialization enabled, checking for existing realm...");

      try {
        if (!realmExists(realmName)) {
          log.info("Realm '{}' does not exist. Creating...", realmName);

          realmManager.createRealm(realmName);
          clientManager.createClient();

          log.info("Realm '{}' created successfully", realmName);
        }
        createAdminAccount();
      } catch (Exception e) {
        log.error("Error during realm initialization: {}", e.getMessage(), e);
        throw new RuntimeException("Failed to initialize realm", e);
      }
    }
  }

  private boolean realmExists(String realmName) {
    try {
      return keycloak.realm(realmName).toRepresentation() != null;
    } catch (Exception e) {
      log.debug("Realm '{}' does not exist: {}", realmName, e.getMessage());
      return false;
    }
  }

  private void createAdminAccount() {
    try {
      KeycloakProperties.InitializationConfig.AdminAccountConfig adminConfig =
          keycloakProperties.getInitialization().getAdminAccount();

      if (userManager.userExists(adminConfig.getUsername())) return;

      userManager.createUser(
          adminConfig.getUsername(),
          adminConfig.getEmail(),
          adminConfig.getFirstName(),
          adminConfig.getLastName(),
          adminConfig.getPassword(),
          true,
          true,
          adminConfig.getId());

      userManager.assignRoleToUser(adminConfig.getId(), Role.SYSTEM_ADMINISTRATOR.name());
    } catch (Exception e) {
      log.error("Error creating admin account: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to create admin account", e);
    }
  }
}
