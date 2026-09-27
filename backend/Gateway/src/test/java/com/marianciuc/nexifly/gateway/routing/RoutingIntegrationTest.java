package com.marianciuc.nexifly.gateway.routing;

import com.marianciuc.nexifly.gateway.GatewayApplication;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webtestclient.autoconfigure.AutoConfigureWebTestClient;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Integration tests for Gateway routing and edge security.
 */
@SpringBootTest(
    classes = GatewayApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient(timeout = "15000")
@ActiveProfiles("test")
public class RoutingIntegrationTest {

  @Autowired private WebTestClient webTestClient;

  @Test
  @DisplayName("Should route to Swagger UI")
  void shouldRouteToSwaggerUI() {
    webTestClient
        .get()
        .uri("/swagger-ui.html")
        .exchange()
        .expectStatus().is3xxRedirection();
  }

  @Test
  @DisplayName("Should route to API docs")
  void shouldRouteToApiDocs() {
    webTestClient
        .get()
        .uri("/v3/api-docs")
        .exchange()
        .expectStatus().isOk();
  }

  @Test
  @DisplayName("Should route to aggregated API docs")
  void shouldRouteToAggregatedApiDocs() {
    webTestClient
        .get()
        .uri("/v3/api-docs/aggregated")
        .exchange()
        .expectStatus().isOk();
  }

  @Test
  @DisplayName("Should route to fallback controller for user service")
  void shouldRouteToFallbackControllerForUserService() {
    webTestClient
        .get()
        .uri("/fallback/user-service")
        .exchange()
        .expectStatus().is5xxServerError()
        .expectBody(String.class)
        .consumeWith(
            response -> {
              assertTrue(
                  response.getResponseBody() != null
                      && response.getResponseBody().contains("User service is currently unavailable"));
            });
  }

  @Test
  @DisplayName("Should route to fallback controller for unknown service")
  void shouldRouteToFallbackControllerForUnknownService() {
    webTestClient
        .get()
        .uri("/fallback/unknown-service")
        .exchange()
        .expectStatus().is5xxServerError();
  }

  @Test
  @DisplayName("Should route to actuator health endpoint")
  void shouldRouteToActuatorHealthEndpoint() {
    webTestClient
        .get()
        .uri("/actuator/health")
        .exchange()
        .expectStatus().isOk();
  }

  @Test
  @DisplayName("Should return 401 Unauthorized for protected endpoints without authentication")
  void shouldReturn401UnauthorizedForProtectedEndpointsWithoutAuthentication() {
    webTestClient
        .get()
        .uri("/api/v1/users/profile")
        .exchange()
        .expectStatus().isUnauthorized();
  }
}
