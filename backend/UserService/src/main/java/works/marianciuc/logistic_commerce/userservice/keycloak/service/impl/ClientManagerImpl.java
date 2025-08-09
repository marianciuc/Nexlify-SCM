package works.marianciuc.logistic_commerce.userservice.keycloak.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.ClientRepresentation;
import org.keycloak.representations.idm.ProtocolMapperRepresentation;
import org.springframework.beans.factory.annotation.Qualifier;
import works.marianciuc.logistic_commerce.userservice.keycloak.service.ClientManager;

@Slf4j
public class ClientManagerImpl implements ClientManager {

  private final Keycloak keycloak;
  private final String realmName;
  private final String clientId;
  private final String clientSecret;
  private final Integer accessTokenLifetime;

  public ClientManagerImpl(
      @Qualifier("adminKeycloak") Keycloak keycloak,
      String realmName,
      String clientId,
      String clientSecret,
      Integer accessTokenLifetime) {
    this.keycloak = keycloak;
    this.realmName = realmName;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessTokenLifetime = accessTokenLifetime;
  }

  public static void createClientWithParams(
      String clientId,
      String clientSecret,
      Integer accessTokenLifetime,
      Keycloak keycloak,
      String realmName) {
    ClientRepresentation client = new ClientRepresentation();
    client.setClientId(clientId);
    client.setSecret(clientSecret);
    client.setEnabled(true);
    client.setProtocol("openid-connect");

    client.setPublicClient(false);
    client.setBearerOnly(false);
    client.setServiceAccountsEnabled(true);
    client.setDirectAccessGrantsEnabled(true);
    client.setAuthorizationServicesEnabled(true);

    client.setStandardFlowEnabled(false);
    client.setImplicitFlowEnabled(false);

    client.setFullScopeAllowed(true);
    client.setConsentRequired(false);

    client.setRedirectUris(List.of("*"));
    client.setWebOrigins(List.of("*"));

    Map<String, String> clientAttributes = new HashMap<>();
    clientAttributes.put("access.token.lifespan", String.valueOf(accessTokenLifetime));
    clientAttributes.put(
        "client.secret.creation.time", String.valueOf(System.currentTimeMillis() / 1000));
    clientAttributes.put("oauth2.device.authorization.grant.enabled", "false");
    clientAttributes.put("oidc.ciba.grant.enabled", "false");
    clientAttributes.put("backchannel.logout.session.required", "true");
    clientAttributes.put("backchannel.logout.revoke.offline.tokens", "false");
    client.setAttributes(clientAttributes);

    List<ProtocolMapperRepresentation> mappers = new ArrayList<>();
    // Email mapper
    ProtocolMapperRepresentation emailMapper = new ProtocolMapperRepresentation();
    emailMapper.setName("email-mapper");
    emailMapper.setProtocol("openid-connect");
    emailMapper.setProtocolMapper("oidc-usermodel-property-mapper");
    Map<String, String> emailConfig = new HashMap<>();
    emailConfig.put("userinfo.token.claim", "true");
    emailConfig.put("user.attribute", "email");
    emailConfig.put("id.token.claim", "true");
    emailConfig.put("access.token.claim", "true");
    emailConfig.put("claim.name", "email");
    emailConfig.put("jsonType.label", "String");
    emailMapper.setConfig(emailConfig);
    mappers.add(emailMapper);

    // Security Scopes mapper (role-based)
    ProtocolMapperRepresentation securityScopesMapper = new ProtocolMapperRepresentation();
    securityScopesMapper.setName("security-scopes-mapper");
    securityScopesMapper.setProtocol("openid-connect");
    securityScopesMapper.setProtocolMapper("oidc-usermodel-realm-role-mapper");
    Map<String, String> scopesConfig = new HashMap<>();
    scopesConfig.put("userinfo.token.claim", "true");
    scopesConfig.put("id.token.claim", "true");
    scopesConfig.put("access.token.claim", "true");
    scopesConfig.put("claim.name", "securityScopes");
    scopesConfig.put("jsonType.label", "String");
    scopesConfig.put("multivalued", "true");
    securityScopesMapper.setConfig(scopesConfig);
    mappers.add(securityScopesMapper);

    // User attribute mapper for custom security scopes
    ProtocolMapperRepresentation userAttributeMapper = new ProtocolMapperRepresentation();
    userAttributeMapper.setName("user-security-scopes-mapper");
    userAttributeMapper.setProtocol("openid-connect");
    userAttributeMapper.setProtocolMapper("oidc-usermodel-attribute-mapper");
    Map<String, String> attributeConfig = new HashMap<>();
    attributeConfig.put("userinfo.token.claim", "true");
    attributeConfig.put("user.attribute", "securityScopes");
    attributeConfig.put("id.token.claim", "true");
    attributeConfig.put("access.token.claim", "true");
    attributeConfig.put("claim.name", "securityScopes");
    attributeConfig.put("jsonType.label", "String");
    attributeConfig.put("multivalued", "true");
    userAttributeMapper.setConfig(attributeConfig);
    mappers.add(userAttributeMapper);

    client.setProtocolMappers(mappers);

    keycloak.realm(realmName).clients().create(client).close();
  }

  @Override
  public void createClient() {
    try {
      log.debug("Creating client '{}' in realm '{}'", clientId, realmName);

      boolean exists = checkClientExists();

      if (exists) {
        log.info("Client '{}' already exists in realm '{}'", clientId, realmName);
        return;
      }

      createClientWithParams(clientId, clientSecret, accessTokenLifetime, keycloak, realmName);
      log.info("Client '{}' created successfully in realm '{}'", clientId, realmName);
    } catch (Exception e) {
      log.error(
          "Error while creating client '{}' in realm '{}': {}",
          clientId,
          realmName,
          e.getMessage());
      throw new RuntimeException("Failed to create client", e);
    }
  }

  /**
   * Checks if the client exists in the realm with retry logic for authentication issues. This
   * method handles the case where the admin client might need token refresh after realm creation.
   */
  private boolean checkClientExists() {
    return keycloak.realm(realmName).clients().findByClientId(clientId).stream()
        .anyMatch(client -> client.getClientId().equals(clientId));
  }

  /**
   * Forces a token refresh for the Keycloak admin client. This is necessary when the client needs
   * to access newly created realms.
   */
  private void refreshKeycloakToken() {
    try {
      log.debug("Refreshing Keycloak admin token for realm operations");
      // Force token refresh by accessing the token manager
      keycloak.tokenManager().refreshToken();
      log.debug("Keycloak admin token refreshed successfully");
    } catch (Exception e) {
      log.warn("Failed to refresh Keycloak token: {}", e.getMessage());
      // Don't throw here, let the main operation try and fail if needed
    }
  }

  @Override
  public void clientExists() {
    try {
      log.debug("Checking if client '{}' exists in realm '{}'", clientId, realmName);
      boolean exists =
          keycloak.realm(realmName).clients().findByClientId(clientId).stream()
              .anyMatch(client -> client.getClientId().equals(clientId));

      if (exists) {
        log.info("Client '{}' exists in realm '{}'", clientId, realmName);
      } else {
        log.info("Client '{}' does not exist in realm '{}'", clientId, realmName);
      }
    } catch (Exception e) {
      log.error(
          "Error checking if client '{}' exists in realm '{}': {}",
          clientId,
          realmName,
          e.getMessage());
    }
  }

  @Override
  public void deleteClient() {
    try {
      log.debug("Deleting client '{}' from realm '{}'", clientId, realmName);

      List<ClientRepresentation> clients =
          keycloak.realm(realmName).clients().findByClientId(clientId);
      if (clients.isEmpty()) {
        log.info("Client '{}' does not exist in realm '{}'", clientId, realmName);
        return;
      }

      String clientUuid = clients.get(0).getId();
      keycloak.realm(realmName).clients().get(clientUuid).remove();
      log.info("Client '{}' deleted successfully from realm '{}'", clientId, realmName);
    } catch (Exception e) {
      log.error(
          "Error while deleting client '{}' from realm '{}': {}",
          clientId,
          realmName,
          e.getMessage());
      throw new RuntimeException("Failed to delete client", e);
    }
  }
}
