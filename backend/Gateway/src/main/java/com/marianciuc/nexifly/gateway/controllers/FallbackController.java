package com.marianciuc.nexifly.gateway.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/fallback")
@Slf4j
@Tag(name = "Fallback", description = "Circuit breaker fallback endpoints")
public class FallbackController {

  private static final String SERVICE_UNAVAILABLE_CODE = "SERVICE_UNAVAILABLE";
  private static final String DEFAULT_FALLBACK_MESSAGE = "The requested service is currently unavailable. Please try again later.";
  private static final String FALLBACK_PATH = "/fallback";

  @GetMapping("/**")
  @Operation(summary = "Default fallback endpoint", description = "Provides graceful degradation response when circuit breakers are triggered for any service")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "503", description = "Service temporarily unavailable due to circuit breaker activation", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(description = "Error response indicating service unavailability")))
      })
  public ResponseEntity<Map<String, Object>> defaultFallback() {
    log.error("A service is unavailable. Circuit breaker triggered.");

    Map<String, Object> response = createFallbackResponse(DEFAULT_FALLBACK_MESSAGE, HttpStatus.SERVICE_UNAVAILABLE.value());
    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
  }

  private Map<String, Object> createFallbackResponse(String message, int statusCode) {
    return Map.of(
        "error", true,
        "status", statusCode,
        "message", message,
        "code", SERVICE_UNAVAILABLE_CODE,
        "timestamp", System.currentTimeMillis(),
        "path", FALLBACK_PATH);
  }

  @RequestMapping("/user-service")
  public ResponseEntity<String> userServiceFallback() {
    return ResponseEntity.status(503).body("User service is currently unavailable");
  }
}
