package com.marianciuc.nexifly.gateway.config;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for OpenAPI aggregation feature. These properties allow customization of
 * the service discovery and aggregation behavior.
 */
@Data
@Component
@ConfigurationProperties(prefix = "gateway.openapi.aggregation")
public class OpenApiAggregationProperties {

  /** Whether OpenAPI aggregation is enabled. Default: true */
  private boolean enabled = true;

  /**
   * Services to exclude from OpenAPI aggregation. These services will not appear in the aggregated
   * documentation.
   */
  private Set<String> excludedServices = Set.of("consul", "keycloak", "gateway");

  /**
   * Static service URLs mapping (service-name -> baseUrl) used as fallback or for direct access
   * when Consul discovery is not available. Example: "user-service" -> "http://localhost:8081"
   */
  private Map<String, String> staticServiceUrls = new LinkedHashMap<>();

  /** Whether to log detailed information about service discovery and aggregation. Default: false */
  private boolean verboseLogging = false;
}
