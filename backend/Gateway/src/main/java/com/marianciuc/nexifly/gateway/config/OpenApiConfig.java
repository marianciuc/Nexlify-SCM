package com.marianciuc.nexifly.gateway.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.OAuthFlow;
import io.swagger.v3.oas.models.security.OAuthFlows;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class OpenApiConfig {

  private static final String OAUTH2_SCHEME = "keycloak";

  @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:http://localhost:9090/realms/LogisticCommerce}")
  private String keycloakIssuerUri;

  @Value("${server.port:8888}")
  private String serverPort;

  @Bean
  public OpenAPI gatewayOpenAPI() {
    log.info("Configuring OpenAPI specification for Nexlify-SCM API Gateway");
    return new OpenAPI()
        .info(
            new Info()
                .title("Nexlify SCM - API Gateway")
                .version("1.0.0")
                .description(
                    "API Gateway documentation and service aggregation endpoint for Nexlify-SCM platform"))
        .addServersItem(
            new Server().url("http://localhost:" + serverPort).description("Gateway Server"))
        .components(
            new Components()
                .addSecuritySchemes(OAUTH2_SCHEME, createOAuth2Scheme()));
  }

  private SecurityScheme createOAuth2Scheme() {
    return new SecurityScheme()
        .type(SecurityScheme.Type.OAUTH2)
        .flows(
            new OAuthFlows()
                .authorizationCode(
                    new OAuthFlow()
                        .authorizationUrl(keycloakIssuerUri + "/protocol/openid-connect/auth")
                        .tokenUrl(keycloakIssuerUri + "/protocol/openid-connect/token")
                        .refreshUrl(keycloakIssuerUri + "/protocol/openid-connect/token")));
  }
}
