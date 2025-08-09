package works.marianciuc.logistic_commerce.userservice.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import java.util.Map;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import works.marianciuc.logistic_commerce.userservice.domain.enums.SecurityScope;

@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI customOpenAPI() {
    return new OpenAPI()
        .info(
            new Info()
                .title("Logistic Commerce User Service API")
                .version("1.0.0")
                .description("API documentation for the User Service in Logistic Commerce system")
                .license(
                    new License().name("MIT License").url("https://opensource.org/licenses/MIT")))
        .servers(
            List.of(
                new Server().url("http://localhost:8080").description("Direct UserService access"),
                new Server().url("http://localhost:8888").description("Gateway access"),
                new Server()
                    .url("http://localhost:8888/user-service")
                    .description("Gateway with service prefix")))
        .components(
            new Components()
                .addSecuritySchemes(
                    "bearerAuth",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("JWT token authentication"))
                .addSchemas(
                    "SecurityScope",
                    new Schema<SecurityScope>()
                        .type("string")
                        .description("Security possibility")
                        .example("MOD_001_001")))
        .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
        .extensions(Map.of("x-group", "user-service"));
  }
}
