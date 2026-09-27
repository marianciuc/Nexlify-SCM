package com.marianciuc.nexifly.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

/**
 * Reactive edge security configuration for API Gateway.
 * Configures open access for Swagger UI, OpenAPI documentation, actuator health,
 * and auth endpoints, while routing API requests through OpaqueTokenGlobalFilter.
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

  @Bean
  public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
    return http
        .csrf(ServerHttpSecurity.CsrfSpec::disable)
        .cors(Customizer.withDefaults())
        .authorizeExchange(exchanges -> exchanges
            .pathMatchers(
                "/v3/api-docs/**",
                "/swagger-ui.html",
                "/swagger-ui/**",
                "/webjars/**",
                "/actuator/**",
                "/fallback/**",
                "/*/v3/api-docs/**",
                "/api/v1/auth/**",
                "/ws/**"
            ).permitAll()
            .anyExchange().permitAll()
        )
        .build();
  }
}
