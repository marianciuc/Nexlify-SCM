package works.marianciuc.logistic_commerce.userservice.config;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.autoconfigure.security.oauth2.resource.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.cloud.consul.config.ConsulConfigAutoConfiguration;
import org.springframework.cloud.consul.discovery.ConsulDiscoveryClientConfiguration;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("test")
@EnableAutoConfiguration(
    exclude = {
      ConsulConfigAutoConfiguration.class,
      ConsulDiscoveryClientConfiguration.class,
      OAuth2ResourceServerAutoConfiguration.class,
      FlywayAutoConfiguration.class
    })
public class TestConfiguration {
  // Minimal test configuration that excludes problematic components
}
