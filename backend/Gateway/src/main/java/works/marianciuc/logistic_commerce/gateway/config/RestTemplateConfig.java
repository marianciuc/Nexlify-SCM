package works.marianciuc.logistic_commerce.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration for HTTP clients used in the Gateway. Provides RestTemplate bean for synchronous
 * HTTP calls.
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
}
