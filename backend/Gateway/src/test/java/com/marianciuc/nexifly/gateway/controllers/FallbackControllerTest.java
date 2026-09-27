package com.marianciuc.nexifly.gateway.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;

class FallbackControllerTest {

  private WebTestClient webTestClient;

  @BeforeEach
  void setUp() {
    webTestClient = WebTestClient.bindToController(new FallbackController()).build();
  }

  @Test
  @DisplayName("Should return service unavailable response for user service fallback")
  void shouldReturnServiceUnavailableResponseForUserServiceFallback() {
    webTestClient
        .get()
        .uri("/fallback/user-service")
        .exchange()
        .expectStatus().is5xxServerError()
        .expectBody(String.class)
        .isEqualTo("User service is currently unavailable");
  }

  @Test
  @DisplayName("Should return service unavailable response for any service fallback")
  void shouldReturnServiceUnavailableResponseForAnyServiceFallback() {
    webTestClient
        .get()
        .uri("/fallback/unknown-service")
        .exchange()
        .expectStatus().is5xxServerError()
        .expectHeader().contentType(MediaType.APPLICATION_JSON)
        .expectBody()
        .jsonPath("$.error").isEqualTo(true)
        .jsonPath("$.status").isEqualTo(503)
        .jsonPath("$.code").isEqualTo("SERVICE_UNAVAILABLE");
  }

  @Test
  @DisplayName("Should return service unavailable response for root fallback path")
  void shouldReturnServiceUnavailableResponseForRootFallbackPath() {
    webTestClient
        .get()
        .uri("/fallback")
        .exchange()
        .expectStatus().is5xxServerError()
        .expectHeader().contentType(MediaType.APPLICATION_JSON)
        .expectBody()
        .jsonPath("$.error").isEqualTo(true)
        .jsonPath("$.status").isEqualTo(503)
        .jsonPath("$.code").isEqualTo("SERVICE_UNAVAILABLE");
  }
}
