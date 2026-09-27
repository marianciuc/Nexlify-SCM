package com.marianciuc.nexifly.gateway.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marianciuc.nexifly.gateway.config.OpenApiAggregationProperties;
import io.swagger.v3.core.util.Json;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenApiAggregationService {

  private final ServiceDiscoveryService serviceDiscoveryService;
  private final OpenApiAggregationProperties properties;
  private final RestTemplate restTemplate;
  private final ObjectMapper objectMapper;

  @Value("${server.port:8888}")
  private String serverPort = "8888";

  /**
   * Returns the aggregated OpenAPI specification as an OpenAPI object
   *
   * @return OpenAPI object containing all service specifications
   */
  public OpenAPI getAggregatedOpenApiObject() {
    try {
      JsonNode aggregatedSpec = getAggregatedOpenApiSpec();
      if (aggregatedSpec == null) {
        log.warn("No aggregated OpenAPI specification available, returning default");
        return createDefaultOpenAPI();
      }

      String jsonString = objectMapper.writeValueAsString(aggregatedSpec);
      OpenAPI openAPI = Json.mapper().readValue(jsonString, OpenAPI.class);

      log.info("Successfully converted aggregated OpenAPI specification to OpenAPI object");
      return openAPI;
    } catch (Exception e) {
      log.error("Failed to convert aggregated OpenAPI to OpenAPI object: {}", e.getMessage(), e);
      return createDefaultOpenAPI();
    }
  }

  public OpenAPI createDefaultOpenAPI() {
    return new OpenAPI()
        .info(
            new Info()
                .title("Nexlify SCM - Aggregated API Documentation")
                .version("1.0.0")
                .description("Unified API documentation for all services"))
        .addServersItem(
            new Server().url("http://localhost:" + serverPort).description("Gateway server"))
        .components(new Components());
  }

  public JsonNode fetchOpenApiSpec(String serviceName) {
    String openApiUrl = null;
    ServiceInstance instance = serviceDiscoveryService.getServiceInstance(serviceName);
    if (instance != null) {
      openApiUrl = buildDirectOpenApiUrl(instance);
    } else if (properties.getStaticServiceUrls() != null
        && properties.getStaticServiceUrls().containsKey(serviceName)) {
      openApiUrl = properties.getStaticServiceUrls().get(serviceName) + "/v3/api-docs";
    }

    if (openApiUrl == null) {
      log.debug("No instance or static URL available for service: {}", serviceName);
      return null;
    }

    try {
      log.debug("Fetching OpenAPI spec from: {}", openApiUrl);
      String response = restTemplate.getForObject(openApiUrl, String.class);

      if (response != null) {
        return objectMapper.readTree(response);
      }
    } catch (HttpClientErrorException e) {
      log.warn(
          "HTTP error fetching OpenAPI spec for service {}: {} - {}",
          serviceName,
          e.getStatusCode(),
          e.getMessage());
    } catch (ResourceAccessException e) {
      log.warn(
          "Connection error fetching OpenAPI spec for service {}: {}", serviceName, e.getMessage());
    } catch (Exception e) {
      log.error(
          "Unexpected error fetching OpenAPI spec for service {}: {}",
          serviceName,
          e.getMessage(),
          e);
    }

    return null;
  }

  public Map<String, JsonNode> getAllOpenApiSpecs() {
    List<String> apiServices = serviceDiscoveryService.discoverApiServices();
    Set<String> allServiceNames = new LinkedHashSet<>(apiServices);
    if (properties.getStaticServiceUrls() != null) {
      allServiceNames.addAll(properties.getStaticServiceUrls().keySet());
    }

    Map<String, JsonNode> specs = new HashMap<>();

    for (String serviceName : allServiceNames) {
      JsonNode spec = fetchOpenApiSpec(serviceName);
      if (spec != null) {
        specs.put(serviceName, spec);
      }
    }

    log.info(
        "Successfully fetched OpenAPI specs for {} out of {} candidate services",
        specs.size(),
        allServiceNames.size());
    return specs;
  }

  private String buildDirectOpenApiUrl(ServiceInstance instance) {
    return instance.getUri() + "/v3/api-docs";
  }

  public JsonNode getAggregatedOpenApiSpec() {
    log.info("Creating aggregated OpenAPI specification");

    Map<String, JsonNode> allSpecs = getAllOpenApiSpecs();

    ObjectNode aggregatedSpec = objectMapper.createObjectNode();
    aggregatedSpec.put("openapi", "3.0.3");

    ObjectNode info = objectMapper.createObjectNode();
    info.put("title", "Nexlify SCM - Aggregated API Documentation");
    info.put("version", "1.0.0");
    info.put(
        "description",
        "Aggregated OpenAPI documentation for all microservices in the Nexlify SCM platform");
    aggregatedSpec.set("info", info);

    ArrayNode servers = objectMapper.createArrayNode();
    ObjectNode server = objectMapper.createObjectNode();
    server.put("url", "http://localhost:" + serverPort);
    server.put("description", "Gateway server");
    servers.add(server);
    aggregatedSpec.set("servers", servers);

    ObjectNode paths = objectMapper.createObjectNode();
    ObjectNode components = objectMapper.createObjectNode();
    ArrayNode tags = objectMapper.createArrayNode();
    Set<String> addedTags = new HashSet<>();

    ObjectNode schemas = objectMapper.createObjectNode();
    ObjectNode responses = objectMapper.createObjectNode();
    ObjectNode parameters = objectMapper.createObjectNode();
    ObjectNode examples = objectMapper.createObjectNode();
    ObjectNode requestBodies = objectMapper.createObjectNode();
    ObjectNode headers = objectMapper.createObjectNode();
    ObjectNode securitySchemes = objectMapper.createObjectNode();
    ObjectNode links = objectMapper.createObjectNode();
    ObjectNode callbacks = objectMapper.createObjectNode();

    for (Map.Entry<String, JsonNode> entry : allSpecs.entrySet()) {
      String serviceName = entry.getKey();
      JsonNode serviceSpec = entry.getValue();

      log.debug("Processing OpenAPI spec for service: {}", serviceName);

      JsonNode servicePaths = serviceSpec.get("paths");
      if (servicePaths != null && servicePaths.isObject()) {
        servicePaths
            .fields()
            .forEachRemaining(
                pathEntry -> {
                  String originalPath = pathEntry.getKey();
                  paths.set(originalPath, pathEntry.getValue());
                });
      }

      JsonNode serviceComponents = serviceSpec.get("components");
      if (serviceComponents != null && serviceComponents.isObject()) {
        mergeComponentSection(serviceComponents, "schemas", schemas, serviceName);
        mergeComponentSection(serviceComponents, "responses", responses, serviceName);
        mergeComponentSection(serviceComponents, "parameters", parameters, serviceName);
        mergeComponentSection(serviceComponents, "examples", examples, serviceName);
        mergeComponentSection(serviceComponents, "requestBodies", requestBodies, serviceName);
        mergeComponentSection(serviceComponents, "headers", headers, serviceName);
        mergeComponentSection(serviceComponents, "securitySchemes", securitySchemes, serviceName);
        mergeComponentSection(serviceComponents, "links", links, serviceName);
        mergeComponentSection(serviceComponents, "callbacks", callbacks, serviceName);
      }

      JsonNode serviceTags = serviceSpec.get("tags");
      if (serviceTags != null && serviceTags.isArray()) {
        for (JsonNode tag : serviceTags) {
          if (tag.has("name")) {
            String tagName = tag.get("name").asText();

            if (!addedTags.contains(tagName)) {
              ObjectNode newTag = objectMapper.createObjectNode();
              newTag.put("name", tagName);

              if (tag.has("description")) {
                newTag.put(
                    "description", "[" + serviceName + "] " + tag.get("description").asText());
              } else {
                newTag.put("description", "Operations from " + serviceName + " service");
              }

              tags.add(newTag);
              addedTags.add(tagName);
            }
          }
        }
      }
    }

    aggregatedSpec.set("paths", paths);

    if (!schemas.isEmpty()) components.set("schemas", schemas);
    if (!responses.isEmpty()) components.set("responses", responses);
    if (!parameters.isEmpty()) components.set("parameters", parameters);
    if (!examples.isEmpty()) components.set("examples", examples);
    if (!requestBodies.isEmpty()) components.set("requestBodies", requestBodies);
    if (!headers.isEmpty()) components.set("headers", headers);
    if (!securitySchemes.isEmpty()) components.set("securitySchemes", securitySchemes);
    if (!links.isEmpty()) components.set("links", links);
    if (!callbacks.isEmpty()) components.set("callbacks", callbacks);

    if (!components.isEmpty()) {
      aggregatedSpec.set("components", components);
    }

    if (!tags.isEmpty()) {
      aggregatedSpec.set("tags", tags);
    }

    log.info(
        "Successfully created aggregated OpenAPI specification with {} paths from {} services",
        paths.size(),
        allSpecs.size());

    return aggregatedSpec;
  }

  private void mergeComponentSection(
      JsonNode serviceComponents,
      String sectionName,
      ObjectNode targetSection,
      String serviceName) {
    JsonNode section = serviceComponents.get(sectionName);
    if (section != null && section.isObject()) {
      section
          .fields()
          .forEachRemaining(
              entry -> {
                targetSection.set(entry.getKey(), entry.getValue());
              });
    }
  }
}
