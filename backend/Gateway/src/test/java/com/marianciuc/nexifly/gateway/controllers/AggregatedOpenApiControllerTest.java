package com.marianciuc.nexifly.gateway.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marianciuc.nexifly.gateway.config.OpenApiAggregationProperties;
import com.marianciuc.nexifly.gateway.service.OpenApiAggregationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Aggregated OpenAPI Controller Tests")
class AggregatedOpenApiControllerTest {

  @Mock private OpenApiAggregationService openApiAggregationService;
  @Mock private OpenApiAggregationProperties properties;

  private AggregatedOpenApiController controller;
  private ObjectMapper objectMapper;

  @BeforeEach
  void setUp() {
    objectMapper = new ObjectMapper();
    controller = new AggregatedOpenApiController(openApiAggregationService, properties, objectMapper);
  }

  @Test
  @DisplayName("Should return aggregated OpenAPI specification when enabled")
  void shouldReturnAggregatedOpenApiSpecWhenEnabled() throws Exception {
    System.out.println(
        "[DEBUG_LOG] Testing aggregated OpenAPI specification retrieval when enabled");

    // Arrange
    when(properties.isEnabled()).thenReturn(true);

    // Create a mock aggregated specification
    JsonNode mockSpec =
        objectMapper.readTree(
            """
            {
                "openapi": "3.0.3",
                "info": {
                    "title": "Logistic Commerce - Aggregated API Documentation",
                    "version": "1.0.0",
                    "description": "Aggregated OpenAPI documentation for all microservices"
                },
                "paths": {
                    "/user-service/api/users": {
                        "get": {
                            "summary": "Get users",
                            "responses": {
                                "200": {
                                    "description": "Success"
                                }
                            }
                        }
                    }
                }
            }
            """);

    when(openApiAggregationService.getAggregatedOpenApiSpec()).thenReturn(mockSpec);

    // Act
    ResponseEntity<String> response = controller.getAggregatedOpenApiSpec();

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertNotNull(response.getBody());

    JsonNode responseBody = objectMapper.readTree(response.getBody());
    assertEquals("3.0.3", responseBody.get("openapi").asText());
    assertEquals(
        "Logistic Commerce - Aggregated API Documentation",
        responseBody.get("info").get("title").asText());
    assertTrue(responseBody.has("paths"));
    assertTrue(responseBody.get("paths").has("/user-service/api/users"));

    System.out.println("[DEBUG_LOG] Successfully retrieved aggregated OpenAPI specification");

    verify(properties).isEnabled();
    verify(openApiAggregationService).getAggregatedOpenApiSpec();
  }

  @Test
  @DisplayName("Should return 503 when aggregation is disabled")
  void shouldReturn503WhenAggregationDisabled() throws Exception {
    System.out.println("[DEBUG_LOG] Testing response when aggregation is disabled");

    // Arrange
    when(properties.isEnabled()).thenReturn(false);

    // Act
    ResponseEntity<String> response = controller.getAggregatedOpenApiSpec();

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
    assertNotNull(response.getBody());

    JsonNode responseBody = objectMapper.readTree(response.getBody());
    assertTrue(responseBody.get("error").asBoolean());
    assertEquals(503, responseBody.get("status").asInt());
    assertEquals("OpenAPI aggregation is disabled", responseBody.get("message").asText());
    assertEquals("/v3/api-docs/aggregated", responseBody.get("path").asText());

    System.out.println("[DEBUG_LOG] Correctly returned 503 when aggregation is disabled");

    verify(properties).isEnabled();
    verifyNoInteractions(openApiAggregationService);
  }

  @Test
  @DisplayName("Should return 500 when service returns null")
  void shouldReturn500WhenServiceReturnsNull() throws Exception {
    System.out.println("[DEBUG_LOG] Testing response when service returns null");

    // Arrange
    when(properties.isEnabled()).thenReturn(true);
    when(openApiAggregationService.getAggregatedOpenApiSpec()).thenReturn(null);

    // Act
    ResponseEntity<String> response = controller.getAggregatedOpenApiSpec();

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    assertNotNull(response.getBody());

    JsonNode responseBody = objectMapper.readTree(response.getBody());
    assertTrue(responseBody.get("error").asBoolean());
    assertEquals(500, responseBody.get("status").asInt());
    assertEquals(
        "Failed to generate aggregated specification", responseBody.get("message").asText());

    System.out.println("[DEBUG_LOG] Correctly returned 500 when service returns null");

    verify(properties).isEnabled();
    verify(openApiAggregationService).getAggregatedOpenApiSpec();
  }

  @Test
  @DisplayName("Should return 500 when service throws exception")
  void shouldReturn500WhenServiceThrowsException() throws Exception {
    System.out.println("[DEBUG_LOG] Testing response when service throws exception");

    // Arrange
    when(properties.isEnabled()).thenReturn(true);
    when(openApiAggregationService.getAggregatedOpenApiSpec())
        .thenThrow(new RuntimeException("Service unavailable"));

    // Act
    ResponseEntity<String> response = controller.getAggregatedOpenApiSpec();

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    assertNotNull(response.getBody());

    JsonNode responseBody = objectMapper.readTree(response.getBody());
    assertTrue(responseBody.get("error").asBoolean());
    assertEquals(500, responseBody.get("status").asInt());
    assertTrue(responseBody.get("message").asText().contains("Internal server error"));
    assertTrue(responseBody.get("message").asText().contains("Service unavailable"));

    System.out.println("[DEBUG_LOG] Correctly returned 500 when service throws exception");

    verify(properties).isEnabled();
    verify(openApiAggregationService).getAggregatedOpenApiSpec();
  }

  @Test
  @DisplayName("Should return proper content type")
  void shouldReturnProperContentType() throws Exception {
    System.out.println("[DEBUG_LOG] Testing content type of successful response");

    // Arrange
    when(properties.isEnabled()).thenReturn(true);

    JsonNode mockSpec =
        objectMapper.readTree(
            """
            {
                "openapi": "3.0.3",
                "info": {
                    "title": "Test API",
                    "version": "1.0.0"
                },
                "paths": {}
            }
            """);

    when(openApiAggregationService.getAggregatedOpenApiSpec()).thenReturn(mockSpec);

    // Act
    ResponseEntity<String> response = controller.getAggregatedOpenApiSpec();

    // Assert
    assertNotNull(response);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertNotNull(response.getHeaders().getContentType());
    assertEquals("application/json", response.getHeaders().getContentType().toString());

    System.out.println("[DEBUG_LOG] Content type is correctly set to application/json");

    verify(properties).isEnabled();
    verify(openApiAggregationService).getAggregatedOpenApiSpec();
  }
}
