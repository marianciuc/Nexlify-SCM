package works.marianciuc.logistic_commerce.userservice.config;

import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
    return http.authorizeHttpRequests(
            c -> c.requestMatchers("/error").permitAll().anyRequest().authenticated())
        .build();
  }

  @Bean
  public JwtAuthenticationConverter jwtAuthenticationConverter() {
    var jwtAuthenticationConverter = new JwtAuthenticationConverter();
    jwtAuthenticationConverter.setPrincipalClaimName("email");
    jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(
        jwt -> {
          var authorities = jwtAuthenticationConverter.convert(jwt);
          var roles = (List<String>) jwt.getCla;
        });
  }
}
