package works.marianciuc.logistic_commerce.gateway.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.OAuthFlow;
import io.swagger.v3.oas.models.security.OAuthFlows;
import io.swagger.v3.oas.models.security.SecurityScheme;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import works.marianciuc.logistic_commerce.gateway.service.OpenApiAggregationService;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class OpenApiConfig {

  private static final String OAUTH2_SCHEME = "keycloak";
  private static final String KEYCLOAK_ISSUER_URI = "http://localhost:9090/realms/LogisticCommerce";
  private final OpenApiAggregationService aggregationService;

  @Bean
  public OpenAPI unifiedOpenAPI() {
    var aggregatedOpenAPI = aggregationService.getAggregatedOpenApiObject();
    var components = aggregatedOpenAPI.getComponents();
    return aggregationService
        .getAggregatedOpenApiObject()
        .components(components.addSecuritySchemes(OAUTH2_SCHEME, createOAuth2Scheme()));
  }

  private SecurityScheme createOAuth2Scheme() {
    return new SecurityScheme()
        .type(SecurityScheme.Type.OAUTH2)
        .flows(
            new OAuthFlows()
                .authorizationCode(
                    new OAuthFlow()
                        .authorizationUrl(KEYCLOAK_ISSUER_URI + "/protocol/openid-connect/auth")
                        .tokenUrl(KEYCLOAK_ISSUER_URI + "/protocol/openid-connect/token")
                        .refreshUrl(KEYCLOAK_ISSUER_URI + "/protocol/openid-connect/token")));
  }
}
