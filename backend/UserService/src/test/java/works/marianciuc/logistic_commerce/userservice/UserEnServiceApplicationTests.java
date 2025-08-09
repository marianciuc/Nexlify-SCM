package works.marianciuc.logistic_commerce.userservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import works.marianciuc.logistic_commerce.userservice.config.TestConfiguration;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.NONE,
    classes = {TestConfiguration.class})
@TestPropertySource(
    properties = {
      "spring.config.import=",
      "spring.cloud.consul.enabled=false",
      "spring.cloud.consul.config.enabled=false",
      "spring.cloud.consul.discovery.enabled=false",
      "spring.datasource.url=jdbc:h2:mem:testdb",
      "spring.datasource.driver-class-name=org.h2.Driver",
      "spring.jpa.hibernate.ddl-auto=create-drop",
      "spring.flyway.enabled=false",
      "keycloak.server-url=http://localhost:9090",
      "init.keycloak.roles=false",
      "init.keycloak.realm=false"
    })
@ActiveProfiles("test")
class UserServiceApplicationTests {

  @Test
  void contextLoads() {
    System.out.println("[DEBUG_LOG] Context loaded successfully");
  }
}
