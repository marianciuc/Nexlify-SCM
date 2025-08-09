package works.marianciuc.logistic_commerce.gateway.routing;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for Gateway routing. These tests verify that the Gateway correctly routes
 * requests to the appropriate endpoints.
 */
@SpringBootTest
@AutoConfigureMockMvc
public class RoutingIntegrationTest {

  @Autowired private MockMvc mockMvc;

  @Test
  @DisplayName("Should route to Swagger UI")
  void shouldRouteToSwaggerUI() throws Exception {
    mockMvc.perform(get("/swagger-ui.html")).andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should route to API docs")
  void shouldRouteToApiDocs() throws Exception {
    mockMvc.perform(get("/v3/api-docs")).andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should route to fallback controller for user service")
  void shouldRouteToFallbackControllerForUserService() throws Exception {
    mockMvc
        .perform(get("/fallback/user-service"))
        .andExpect(status().isServiceUnavailable())
        .andExpect(content().string(containsString("User Service is currently unavailable")));
  }

  @Test
  @DisplayName("Should route to fallback controller for unknown service")
  void shouldRouteToFallbackControllerForUnknownService() throws Exception {
    mockMvc
        .perform(get("/fallback/unknown-service"))
        .andExpect(status().isServiceUnavailable())
        .andExpect(
            content().string(containsString("The requested service is currently unavailable")));
  }

  @Test
  @DisplayName("Should route to actuator health endpoint")
  void shouldRouteToActuatorHealthEndpoint() throws Exception {
    mockMvc.perform(get("/actuator/health")).andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should return 401 Unauthorized for protected endpoints without authentication")
  void shouldReturn401UnauthorizedForProtectedEndpointsWithoutAuthentication() throws Exception {
    mockMvc.perform(get("/api/users/profile")).andExpect(status().isUnauthorized());
  }
}
