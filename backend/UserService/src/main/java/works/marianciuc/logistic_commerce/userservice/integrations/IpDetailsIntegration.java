package works.marianciuc.logistic_commerce.userservice.integrations;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import works.marianciuc.logistic_commerce.userservice.domain.dto.IpInfoDto;

@Component
@RequiredArgsConstructor
@Slf4j
public class IpDetailsIntegration implements IpInfoProvider {

  private final RestTemplate restTemplate;

  @Value("${ip.api.url:http://ip-api.com/json/}")
  private String ipApiUrl;

  @Override
  public IpInfoDto retrieveIpData(String ip) {

    try {
      String url = ipApiUrl + ip;
      IpInfoDto response = restTemplate.getForObject(url, IpInfoDto.class);

      if (response != null && response.status().equals("success")) {
        return response;
      }
      throw new RuntimeException("Failed to get country for IP: " + ip);
    } catch (Exception e) {
      log.error("Failed to get country for IP: {},\n error {}", ip, e.getMessage());
      throw new RuntimeException("Failed to get country for IP: " + ip);
    }
  }
}
