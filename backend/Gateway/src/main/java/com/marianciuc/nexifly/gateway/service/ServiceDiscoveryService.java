package com.marianciuc.nexifly.gateway.service;

import java.util.List;
import java.util.stream.Collectors;

import com.marianciuc.nexifly.gateway.config.OpenApiAggregationProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.stereotype.Service;

/**
 * Service for discovering microservices registered in Consul. This service is responsible for
 * finding all available services that should be included in the aggregated OpenAPI documentation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceDiscoveryService {
  private final DiscoveryClient discoveryClient;
  private final OpenApiAggregationProperties properties;

  /**
   * Discovers all microservices that should be included in OpenAPI documentation.
   *
   * @return List of service names that have OpenAPI documentation
   */
  public List<String> discoverApiServices() {
    if (!properties.isEnabled()) {
      log.debug("OpenAPI aggregation is disabled");
      return List.of();
    }

    try {
      logVerboseMessage("Discovering API services from Consul");

      List<String> allServices = discoveryClient.getServices();
      logVerboseMessage("Found {} total services: {}", allServices.size(), allServices);

      List<String> apiServices = filterEligibleServices(allServices);
      log.info("Discovered {} API services: {}", apiServices.size(), apiServices);
      return apiServices;
    } catch (Exception e) {
      log.warn("Failed to discover services via DiscoveryClient: {}", e.getMessage());
      return List.of();
    }
  }

  /**
   * Filters services to include only those eligible for API documentation.
   *
   * @param allServices List of all discovered services
   * @return List of services that should have API documentation
   */
  private List<String> filterEligibleServices(List<String> allServices) {
    return allServices.stream()
        .filter(
            serviceName -> !properties.getExcludedServices().contains(serviceName.toLowerCase()))
        .collect(Collectors.toList());
  }

  /**
   * Logs a message if verbose logging is enabled.
   *
   * @param message The message to log
   * @param args Optional message arguments
   */
  private void logVerboseMessage(String message, Object... args) {
    if (properties.isVerboseLogging()) {
      log.debug(message, args);
    }
  }

  /**
   * Gets the first available instance of a service.
   *
   * @param serviceName The name of the service
   * @return ServiceInstance if available, null otherwise
   */
  public ServiceInstance getServiceInstance(String serviceName) {
    try {
      List<ServiceInstance> instances = discoveryClient.getInstances(serviceName);
      if (instances.isEmpty()) {
        log.warn("No instances found for service: {}", serviceName);
        return null;
      }

      ServiceInstance instance = instances.getFirst();
      log.debug("Using instance {} for service {}", instance.getUri(), serviceName);
      return instance;
    } catch (Exception e) {
      log.warn("Failed to get instance for service {}: {}", serviceName, e.getMessage());
      return null;
    }
  }
}
