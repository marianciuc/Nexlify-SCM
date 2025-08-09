package works.marianciuc.logistic_commerce.userservice.keycloak.service.impl;

import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.RealmRepresentation;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import works.marianciuc.logistic_commerce.userservice.keycloak.config.KeycloakProperties;
import works.marianciuc.logistic_commerce.userservice.keycloak.service.RealmManager;

@Slf4j
@Service
public class RealmManagerImpl implements RealmManager {

  private final KeycloakProperties keycloakProperties;
  private final Keycloak keycloak;

  public RealmManagerImpl(
      KeycloakProperties keycloakProperties, @Qualifier("adminKeycloak") Keycloak keycloak) {
    this.keycloakProperties = keycloakProperties;
    this.keycloak = keycloak;
  }

  @Override
  public void createRealm(String realm) {
    try {
      log.debug("Creating realm '{}'", realm);
      RealmRepresentation realmRepresentation = new RealmRepresentation();
      realmRepresentation.setRealm(realm);
      realmRepresentation.setDisplayName(realm);
      realmRepresentation.setEnabled(true);

      // Base Settings
      realmRepresentation.setRegistrationAllowed(true);
      realmRepresentation.setRegistrationEmailAsUsername(true);
      realmRepresentation.setLoginWithEmailAllowed(true);
      realmRepresentation.setResetPasswordAllowed(true);
      realmRepresentation.setDuplicateEmailsAllowed(false);
      realmRepresentation.setEditUsernameAllowed(false);
      realmRepresentation.setVerifyEmail(false);
      realmRepresentation.setLoginTheme(null);
      realmRepresentation.setAccountTheme(null);
      realmRepresentation.setEmailTheme("base");

      configureSecurity(realmRepresentation);

      Map<String, String> attributes = new HashMap<>();
      attributes.put(
          "refreshTokenLifespan",
          String.valueOf(keycloakProperties.getSecurity().getToken().getRefresh().getLifetime()));
      attributes.put("clientSessionIdleTimeout", "0");
      attributes.put("clientSessionMaxLifespan", "0");
      realmRepresentation.setAttributes(attributes);

      keycloak.realms().create(realmRepresentation);
      log.info("Realm '{}' created successfully", realm);
    } catch (Exception e) {
      log.error("Error while creating realm '{}': {}", realm, e.getMessage());
      throw new RuntimeException("Failed to create realm", e);
    }
  }

  @Override
  public void deleteRealm(String realm) {
    try {
      log.debug("Deleting realm '{}'", realm);
      keycloak.realm(realm).remove();
      log.info("Realm '{}' deleted successfully", realm);
    } catch (Exception e) {
      log.error("Error while deleting realm '{}': {}", realm, e.getMessage());
      throw new RuntimeException("Failed to delete realm", e);
    }
  }

  public void deleteRealm() {
    deleteRealm(keycloakProperties.getDefaultClient().getRealm());
  }

  private boolean isRealmExists(String realmName) {
    try {
      RealmRepresentation realm = keycloak.realm(realmName).toRepresentation();
      return realm != null;
    } catch (Exception e) {
      log.error("Error checking realm existence: {}", e.getMessage());
      return false;
    }
  }

  private void configureSecurity(RealmRepresentation realm) {
    // Security
    realm.setSslRequired("external");
    realm.setRevokeRefreshToken(
        keycloakProperties.getSecurity().getToken().getRefresh().isCanBeRevoked());
    realm.setRefreshTokenMaxReuse(
        keycloakProperties.getSecurity().getToken().getRefresh().getMaxReuse());
    realm.setAccessTokenLifespan(
        keycloakProperties.getSecurity().getToken().getAccess().getLifetime());

    // Bruteforce settings
    realm.setBruteForceProtected(true);
    realm.setFailureFactor(5);
    realm.setWaitIncrementSeconds(60);
    realm.setQuickLoginCheckMilliSeconds(1000L);
    realm.setMinimumQuickLoginWaitSeconds(60);
    realm.setMaxFailureWaitSeconds(900);
    realm.setMaxDeltaTimeSeconds(43200);

    realm.setRememberMe(false);
    realm.setResetCredentialsFlow(null);
    realm.setClientAuthenticationFlow(null);
  }
}
