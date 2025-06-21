package works.marianciuc.logistic_commerce.userservice.config;

import eu.viesapi.client.VIESAPIClient;
import java.net.MalformedURLException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class VIESConfig {

  @Bean
  public VIESAPIClient createClient(
      @Value("${vies.api.key}") String apiKey, @Value("${vies.api.id}") String apiKeyId)
      throws MalformedURLException {
    return new VIESAPIClient(apiKeyId, apiKey);
  }
}
