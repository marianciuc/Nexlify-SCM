package works.marianciuc.logistic_commerce.gateway.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import works.marianciuc.logistic_commerce.gateway.config.OpenApiAggregationProperties;

import java.net.URI;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Service Discovery Service Tests")
class ServiceDiscoveryServiceTest {

  @Mock private DiscoveryClient discoveryClient;

  @Mock private OpenApiAggregationProperties properties;

  @Mock private ServiceInstance serviceInstance;

  private ServiceDiscoveryService serviceDiscoveryService;

  @BeforeEach
  void setUp() {
    serviceDiscoveryService = new ServiceDiscoveryService(discoveryClient, properties);
  }

  @Test
  @DisplayName("Should discover API services when aggregation is enabled")
  void shouldDiscoverApiServicesWhenEnabled() {
    System.out.println("[DEBUG_LOG] Testing service discovery when aggregation is enabled");

    // Arrange
    when(properties.isEnabled()).thenReturn(true);
    when(properties.isVerboseLogging()).thenReturn(false);
    when(properties.getExcludedServices()).thenReturn(Set.of("gateway", "consul", "keycloak"));

    List<String> allServices = List.of("user-service", "gateway", "consul", "order-service");
    when(discoveryClient.getServices()).thenReturn(allServices);

    // Mock service instances
    when(discoveryClient.getInstances("user-service")).thenReturn(List.of(serviceInstance));
    when(discoveryClient.getInstances("order-service")).thenReturn(List.of(serviceInstance));
    when(serviceInstance.getUri()).thenReturn(URI.create("http://localhost:8080"));

    // Act
    List<String> apiServices = serviceDiscoveryService.discoverApiServices();

    // Assert
    assertNotNull(apiServices);
    assertEquals(2, apiServices.size());
    assertTrue(apiServices.contains("user-service"));
    assertTrue(apiServices.contains("order-service"));
    assertFalse(apiServices.contains("gateway"));
    assertFalse(apiServices.contains("consul"));

    System.out.println("[DEBUG_LOG] Successfully discovered services: " + apiServices);

    verify(discoveryClient).getServices();
    verify(properties).isEnabled();
    verify(properties, atLeastOnce()).getExcludedServices();
  }

  @Test
  @DisplayName("Should return empty list when aggregation is disabled")
  void shouldReturnEmptyListWhenDisabled() {
    System.out.println("[DEBUG_LOG] Testing service discovery when aggregation is disabled");

    // Arrange
    when(properties.isEnabled()).thenReturn(false);

    // Act
    List<String> apiServices = serviceDiscoveryService.discoverApiServices();

    // Assert
    assertNotNull(apiServices);
    assertTrue(apiServices.isEmpty());

    System.out.println("[DEBUG_LOG] Correctly returned empty list when disabled");

    verify(properties).isEnabled();
    verifyNoInteractions(discoveryClient);
  }

  @Test
  @DisplayName("Should get service instance successfully")
  void shouldGetServiceInstanceSuccessfully() {
    System.out.println("[DEBUG_LOG] Testing getting service instance");

    // Arrange
    String serviceName = "user-service";
    when(discoveryClient.getInstances(serviceName)).thenReturn(List.of(serviceInstance));
    when(serviceInstance.getUri()).thenReturn(URI.create("http://localhost:8080"));

    // Act
    ServiceInstance result = serviceDiscoveryService.getServiceInstance(serviceName);

    // Assert
    assertNotNull(result);
    assertEquals(serviceInstance, result);

    System.out.println("[DEBUG_LOG] Successfully retrieved service instance");

    verify(discoveryClient).getInstances(serviceName);
  }

  @Test
  @DisplayName("Should return null when no service instances available")
  void shouldReturnNullWhenNoInstancesAvailable() {
    System.out.println("[DEBUG_LOG] Testing getting service instance when none available");

    // Arrange
    String serviceName = "non-existent-service";
    when(discoveryClient.getInstances(serviceName)).thenReturn(List.of());

    // Act
    ServiceInstance result = serviceDiscoveryService.getServiceInstance(serviceName);

    // Assert
    assertNull(result);

    System.out.println("[DEBUG_LOG] Correctly returned null when no instances available");

    verify(discoveryClient).getInstances(serviceName);
  }

  @Test
  @DisplayName("Should filter excluded services correctly")
  void shouldFilterExcludedServicesCorrectly() {
    System.out.println("[DEBUG_LOG] Testing service filtering");

    // Arrange
    when(properties.isEnabled()).thenReturn(true);
    when(properties.isVerboseLogging()).thenReturn(true);
    when(properties.getExcludedServices()).thenReturn(Set.of("gateway", "consul", "keycloak"));

    List<String> allServices =
        List.of("user-service", "gateway", "consul", "keycloak", "order-service");
    when(discoveryClient.getServices()).thenReturn(allServices);

    // Mock service instances for non-excluded services
    when(discoveryClient.getInstances("user-service")).thenReturn(List.of(serviceInstance));
    when(discoveryClient.getInstances("order-service")).thenReturn(List.of(serviceInstance));
    when(serviceInstance.getUri()).thenReturn(URI.create("http://localhost:8080"));

    // Act
    List<String> apiServices = serviceDiscoveryService.discoverApiServices();

    // Assert
    assertNotNull(apiServices);
    assertEquals(2, apiServices.size());
    assertTrue(apiServices.contains("user-service"));
    assertTrue(apiServices.contains("order-service"));

    // Verify excluded services are not included
    assertFalse(apiServices.contains("gateway"));
    assertFalse(apiServices.contains("consul"));
    assertFalse(apiServices.contains("keycloak"));

    System.out.println(
        "[DEBUG_LOG] Successfully filtered excluded services. Final list: " + apiServices);

    verify(properties, atLeastOnce()).getExcludedServices();
  }
}
