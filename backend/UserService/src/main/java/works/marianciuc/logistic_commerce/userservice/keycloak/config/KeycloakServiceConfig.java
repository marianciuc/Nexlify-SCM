package works.marianciuc.logistic_commerce.userservice.keycloak.config;

import org.keycloak.admin.client.Keycloak;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import works.marianciuc.logistic_commerce.userservice.keycloak.service.ClientManager;
import works.marianciuc.logistic_commerce.userservice.keycloak.service.RoleManager;
import works.marianciuc.logistic_commerce.userservice.keycloak.service.UserManager;
import works.marianciuc.logistic_commerce.userservice.keycloak.service.impl.ClientManagerImpl;
import works.marianciuc.logistic_commerce.userservice.keycloak.service.impl.UserManagerImpl;

/**
 * Configuration class for Keycloak service beans. This class creates beans for services that
 * require constructor parameters.
 */
@Configuration
public class KeycloakServiceConfig {

  /**
   * Creates a ClientManager bean with the necessary dependencies.
   *
   * @param keycloak The Keycloak client
   * @param keycloakProperties The Keycloak properties
   * @return A ClientManager instance
   */
  @Bean
  public ClientManager clientManager(
      @Qualifier("adminKeycloak") Keycloak keycloak, KeycloakProperties keycloakProperties) {
    return new ClientManagerImpl(
        keycloak,
        keycloakProperties.getDefaultClient().getRealm(),
        keycloakProperties.getDefaultClient().getClientId(),
        keycloakProperties.getDefaultClient().getClientSecret(),
        keycloakProperties.getSecurity().getToken().getAccess().getLifetime());
  }

  /**
   * Creates a UserManager bean with the necessary dependencies.
   *
   * @param keycloak The Keycloak client
   * @param keycloakProperties The Keycloak properties
   * @param roleManager The RoleManager service
   * @return A UserManager instance
   */
  @Bean
  public UserManager userManager(
      @Qualifier("adminKeycloak") Keycloak keycloak,
      KeycloakProperties keycloakProperties,
      RoleManager roleManager) {
    return new UserManagerImpl(keycloak, keycloakProperties, roleManager);
  }
}
