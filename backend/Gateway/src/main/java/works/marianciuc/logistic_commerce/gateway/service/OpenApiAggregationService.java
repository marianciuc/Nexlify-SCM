package works.marianciuc.logistic_commerce.gateway.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.swagger.v3.core.util.Json;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
  private final RestTemplate restTemplate;
  private final ObjectMapper objectMapper;

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

  private OpenAPI createDefaultOpenAPI() {
    return new OpenAPI()
        .info(
            new Info()
                .title("Logistic Commerce - Aggregated API Documentation")
                .version("1.0.0")
                .description("Unified API documentation for all services"))
        .addServersItem(new Server().url("http://localhost:8888").description("Gateway server"));
  }

  public JsonNode fetchOpenApiSpec(String serviceName) {
    ServiceInstance instance = serviceDiscoveryService.getServiceInstance(serviceName);
    if (instance == null) {
      log.warn("No instance available for service: {}", serviceName);
      return null;
    }

    String openApiUrl = buildDirectOpenApiUrl(instance);

    try {
      log.debug("Fetching OpenAPI spec from: {}", openApiUrl);
      String response = restTemplate.getForObject(openApiUrl, String.class);

      if (response != null) {
        JsonNode openApiSpec = objectMapper.readTree(response);
        return openApiSpec;
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
    Map<String, JsonNode> specs = new HashMap<>();

    for (String serviceName : apiServices) {
      JsonNode spec = fetchOpenApiSpec(serviceName);
      if (spec != null) {
        specs.put(serviceName, spec);
      }
    }

    log.info(
        "Successfully fetched OpenAPI specs for {} out of {} services",
        specs.size(),
        apiServices.size());
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
    info.put("title", "Logistic Commerce - Aggregated API Documentation");
    info.put("version", "1.0.0");
    info.put(
        "description",
        "Aggregated OpenAPI documentation for all microservices in the Logistic Commerce platform");
    aggregatedSpec.set("info", info);

    ArrayNode servers = objectMapper.createArrayNode();
    ObjectNode server = objectMapper.createObjectNode();
    server.put("url", "http://localhost:8888");
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

    if (tags.size() > 0) {
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
