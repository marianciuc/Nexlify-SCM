package works.marianciuc.logistic_commerce.userservice.config;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.oauth2ResourceServer(
        oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));
    return http.authorizeHttpRequests(
            c ->
                c.requestMatchers("/actuator/health", "/actuator/info")
                    .permitAll()
                    .requestMatchers("/error")
                    .permitAll()
                    .anyRequest()
                    .permitAll())
        .csrf(AbstractHttpConfigurer::disable)
        .build();
  }

  @Bean
  public JwtAuthenticationConverter jwtAuthenticationConverter() {
    JwtAuthenticationConverter converter = new JwtAuthenticationConverter();

    Converter<Jwt, Collection<GrantedAuthority>> authoritiesConverter =
        jwt -> {
          Object userScopeClaim = jwt.getClaim("userScope");

          if (userScopeClaim == null) {
            return Collections.emptyList();
          }

          if (userScopeClaim instanceof String scopeString) {
            if (scopeString.trim().isEmpty()) {
              return Collections.emptyList();
            }
            return List.of(scopeString.split("\\s+")).stream()
                .map(scope -> new SimpleGrantedAuthority("ROLE_" + scope.toUpperCase()))
                .collect(Collectors.toList());
          } else if (userScopeClaim instanceof List) {
            @SuppressWarnings("unchecked")
            List<String> scopes = (List<String>) userScopeClaim;
            return scopes.stream()
                .map(scope -> new SimpleGrantedAuthority("ROLE_" + scope.toUpperCase()))
                .collect(Collectors.toList());
          }

          return Collections.emptyList();
        };

    converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
    return converter;
  }
}
