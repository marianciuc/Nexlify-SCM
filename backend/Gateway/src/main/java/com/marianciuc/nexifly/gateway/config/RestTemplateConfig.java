package com.marianciuc.nexifly.gateway.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration for HTTP clients and JSON mapper used in the Gateway.
 */
@Configuration
public class RestTemplateConfig {

  /**
   * Creates a RestTemplate bean for synchronous HTTP calls. Used primarily for fetching OpenAPI
   * documentation from services.
   *
   * @return RestTemplate instance
   */
  @Bean
  public RestTemplate restTemplate() {
    return new RestTemplate();
  }

  /**
   * Creates an ObjectMapper bean for JSON parsing and OpenAPI spec manipulation.
   *
   * @return ObjectMapper instance
   */
  @Bean
  public ObjectMapper objectMapper() {
    return new ObjectMapper();
  }

  /**
   * Creates a WebClient.Builder bean for reactive HTTP calls.
   *
   * @return WebClient.Builder instance
   */
  @Bean
  public org.springframework.web.reactive.function.client.WebClient.Builder webClientBuilder() {
    return org.springframework.web.reactive.function.client.WebClient.builder();
  }

  /**
   * Creates a WebClient bean.
   *
   * @param builder WebClient.Builder
   * @return WebClient instance
   */
  @Bean
  public org.springframework.web.reactive.function.client.WebClient webClient(
      org.springframework.web.reactive.function.client.WebClient.Builder builder) {
    return builder.build();
  }
}
