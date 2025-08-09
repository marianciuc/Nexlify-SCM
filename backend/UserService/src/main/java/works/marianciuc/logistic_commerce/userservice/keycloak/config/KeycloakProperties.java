package works.marianciuc.logistic_commerce.userservice.keycloak.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

/**
 * Centralized configuration properties for Keycloak integration. This class consolidates all
 * Keycloak-related configuration to provide a single source of truth for configuration management.
 */
@Data
@Component
@Validated
@ConfigurationProperties(prefix = "keycloak")
public class KeycloakProperties {

  @NotBlank(message = "Keycloak server URL is required")
  private String serverUrl;

  @Valid
  @NotNull(message = "Default client configuration is required")
  private ClientConfig defaultClient = new ClientConfig();

  @Valid
  @NotNull(message = "Admin client configuration is required")
  private AdminConfig admin = new AdminConfig();

  @Valid
  @NotNull(message = "Security configuration is required")
  private SecurityConfig security = new SecurityConfig();

  @Valid
  @NotNull(message = "Connection configuration is required")
  private ConnectionConfig connection = new ConnectionConfig();

  @Valid
  @NotNull(message = "Initialization configuration is required")
  private InitializationConfig initialization = new InitializationConfig();

  /** Convenience methods for commonly used URLs. */
  public String getTokenUrl(String realm) {
    return String.format("%s/realms/%s/protocol/openid-connect/token", serverUrl, realm);
  }

  public String getRevokeUrl(String realm) {
    return String.format("%s/realms/%s/protocol/openid-connect/revoke", serverUrl, realm);
  }

  public String getDefaultTokenUrl() {
    return getTokenUrl(defaultClient.getRealm());
  }

  public String getDefaultRevokeUrl() {
    return getRevokeUrl(defaultClient.getRealm());
  }

  public String getAdminTokenUrl() {
    return getTokenUrl(admin.getRealm());
  }

  public String getAdminRevokeUrl() {
    return getRevokeUrl(admin.getRealm());
  }

  /** Configuration for the default application client used for user operations. */
  @Data
  public static class ClientConfig {
    @NotBlank(message = "Default realm is required")
    private String realm = "LogisticCommerce";

    @NotBlank(message = "Default client ID is required")
    private String clientId = "application-client";

    @NotBlank(message = "Default client secret is required")
    private String clientSecret;
  }

  /** Configuration for admin operations and realm management. */
  @Data
  public static class AdminConfig {
    @NotBlank(message = "Admin realm is required")
    private String realm = "master";

    @NotBlank(message = "Admin client ID is required")
    private String clientId = "admin-cli";

    @NotBlank(message = "Admin client secret is required")
    private String clientSecret;

    @NotBlank(message = "Admin username is required")
    private String username;

    @NotBlank(message = "Admin password is required")
    private String password;
  }

  /** Security and token configuration. */
  @Data
  public static class SecurityConfig {
    @Valid
    @NotNull(message = "Token configuration is required")
    private TokenConfig token = new TokenConfig();

    @Data
    public static class TokenConfig {
      @Valid
      @NotNull(message = "Access token configuration is required")
      private AccessTokenConfig access = new AccessTokenConfig();

      @Valid
      @NotNull(message = "Refresh token configuration is required")
      private RefreshTokenConfig refresh = new RefreshTokenConfig();

      @Data
      public static class AccessTokenConfig {
        @Positive(message = "Access token lifetime must be positive")
        private int lifetime = 300; // 5 minutes
      }

      @Data
      public static class RefreshTokenConfig {
        @Positive(message = "Refresh token lifetime must be positive")
        private int lifetime = 86400; // 24 hours

        private int maxReuse = 0;

        private boolean canBeRevoked = true;
      }
    }
  }

  /** Connection and performance configuration. */
  @Data
  public static class ConnectionConfig {
    @Positive(message = "Connection timeout must be positive")
    private int timeoutSeconds = 30;

    @Positive(message = "Pool size must be positive")
    private int poolSize = 10;

    @Positive(message = "Retry attempts must be positive")
    private int retryAttempts = 3;

    @Positive(message = "Retry delay must be positive")
    private int retryDelayMs = 1000;
  }

  /** Configuration for Keycloak initialization process. */
  @Data
  public static class InitializationConfig {
    private boolean enableRealmInitialization = false;
    private boolean enableRoleInitialization = false;

    @Valid
    @NotNull(message = "Admin account configuration is required")
    private AdminAccountConfig adminAccount = new AdminAccountConfig();

    @Data
    public static class AdminAccountConfig {
      @NotBlank(message = "Admin username is required")
      private String username = "admin";

      @NotBlank(message = "Admin password is required")
      private String password = "admin";

      @NotBlank(message = "Admin email is required")
      private String email = "admin@logisticcommerce.com";

      @NotBlank(message = "Admin first name is required")
      private String firstName = "System";

      @NotBlank(message = "Admin last name is required")
      private String lastName = "Administrator";

      @NotBlank(message = "ID is required")
      private String id;
    }
  }
}
