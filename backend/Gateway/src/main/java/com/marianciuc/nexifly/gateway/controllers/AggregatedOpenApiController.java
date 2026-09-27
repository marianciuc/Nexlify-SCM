package com.marianciuc.nexifly.gateway.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marianciuc.nexifly.gateway.config.OpenApiAggregationProperties;
import com.marianciuc.nexifly.gateway.service.OpenApiAggregationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v3/api-docs")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "OpenAPI Aggregation", description = "Aggregated OpenAPI documentation endpoint")
public class AggregatedOpenApiController {

    private static final String AGGREGATED_ENDPOINT_PATH = "/v3/api-docs/aggregated";
    private static final String SERVICE_UNAVAILABLE_MESSAGE = "OpenAPI aggregation is disabled";
    private static final String GENERATION_FAILED_MESSAGE = "Failed to generate aggregated specification";

    private final OpenApiAggregationService openApiAggregationService;
    private final OpenApiAggregationProperties properties;
    private final ObjectMapper objectMapper;

    @GetMapping(value = "/aggregated", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Get aggregated OpenAPI specification",
            description = """
                    Returns a single OpenAPI specification that combines all discovered microservices.
                    Paths are prefixed with service names (e.g., /user-service/api/users) to avoid conflicts.
                    This endpoint is designed to work with openapi-typescript for generating TypeScript types
                    for all services at once.
                    """)
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved aggregated OpenAPI specification", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(description = "OpenAPI 3.0.3 specification combining all microservices"))),
                    @ApiResponse(responseCode = "503", description = "OpenAPI aggregation is disabled", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(description = "Error response indicating the feature is disabled"))),
                    @ApiResponse(responseCode = "500", description = "Internal server error while generating aggregated specification", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(description = "Error response with details about the failure")))
            })
    public ResponseEntity<String> getAggregatedOpenApiSpec() {
        log.info("Aggregated OpenAPI specification requested");

        try {
            if (!properties.isEnabled()) {
                return handleDisabledService();
            }

            return generateAggregatedSpec();
        } catch (Exception e) {
            return handleInternalError(e);
        }
    }

    private ResponseEntity<String> handleDisabledService() {
        log.warn(SERVICE_UNAVAILABLE_MESSAGE);
        String errorResponse = createErrorResponse(SERVICE_UNAVAILABLE_MESSAGE, HttpStatus.SERVICE_UNAVAILABLE.value());

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .contentType(MediaType.APPLICATION_JSON)
                .body(errorResponse);
    }

    private ResponseEntity<String> generateAggregatedSpec() {
        JsonNode aggregatedSpec = openApiAggregationService.getAggregatedOpenApiSpec();

        if (aggregatedSpec == null) {
            log.error(GENERATION_FAILED_MESSAGE);
            String errorResponse =
                    createErrorResponse(GENERATION_FAILED_MESSAGE, HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorResponse);
        }

        try {
            String json = objectMapper.writeValueAsString(aggregatedSpec);
            log.info("Successfully returned aggregated OpenAPI specification");
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(json);
        } catch (Exception e) {
            log.error("Error serializing aggregated specification: {}", e.getMessage(), e);
            return handleInternalError(e);
        }
    }

    private ResponseEntity<String> handleInternalError(Exception e) {
        log.error("Error generating aggregated OpenAPI specification: {}", e.getMessage(), e);
        String errorMessage = "Internal server error: " + e.getMessage();
        String errorResponse =
                createErrorResponse(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR.value());
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_JSON)
                .body(errorResponse);
    }

    private String createErrorResponse(String message, int status) {
        try {
            ObjectNode errorResponse = objectMapper.createObjectNode();
            errorResponse.put("error", true);
            errorResponse.put("status", status);
            errorResponse.put("message", message);
            errorResponse.put("timestamp", System.currentTimeMillis());
            errorResponse.put("path", AGGREGATED_ENDPOINT_PATH);
            return objectMapper.writeValueAsString(errorResponse);
        } catch (Exception e) {
            log.error("Failed to create error response: {}", e.getMessage());
            return "{\"error\":true,\"status\":" + status + ",\"message\":\"" + message + "\"}";
        }
    }
}
