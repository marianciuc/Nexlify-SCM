
package works.marianciuc.logistic_commerce.userservice.integrations;

import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import works.marianciuc.logistic_commerce.userservice.domain.dto.IpInfoDto;
import works.marianciuc.logistic_commerce.userservice.exceptions.integrations.IntegrationTimeoutException;
import works.marianciuc.logistic_commerce.userservice.exceptions.integrations.InvalidIpAddressException;
import works.marianciuc.logistic_commerce.userservice.exceptions.integrations.IpGeoLocationServiceException;

/**
 * Integration service for retrieving IP geolocation information using external API.
 *
 * <p>This service provides IP address validation and geolocation data retrieval with proper error
 * handling and custom exceptions.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class IpDetailsIntegration implements IpInfoProvider {

  private final RestTemplate restTemplate;

  @Value("${ip.api.url:http://ip-api.com/json/}")
  private String ipApiUrl;

  // IPv4 and IPv6 validation patterns
  private static final Pattern IPV4_PATTERN =
      Pattern.compile(
          "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$");
  private static final Pattern IPV6_PATTERN =
      Pattern.compile("^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$");
  @Value("${ip.api.timeout:5000}")
  private int timeoutSeconds;
  @Value("${ip.api.retry.enabled:true}")
  private boolean retryEnabled;
  @Value("${ip.api.retry.attempts:3}")
  private int maxRetryAttempts;

  @Override
  public IpInfoDto retrieveIpData(String ip)
      throws InvalidIpAddressException, IpGeoLocationServiceException {
    log.debug("Retrieving IP data for address: {}", ip);
    validateIpAddress(ip);
    return retryEnabled ? retrieveWithRetry(ip) : performApiCall(ip);
  }

  /**
   * Validates the IP address format.
   *
   * @param ip the IP address to validate
   * @throws InvalidIpAddressException if the IP address is invalid
   */
  private void validateIpAddress(String ip) throws InvalidIpAddressException {
    if (ip == null || ip.trim().isEmpty()) {
      log.warn("Empty or null IP address provided");
      throw new InvalidIpAddressException("null or empty");
    }

    String trimmedIp = ip.trim();
    if (isPrivateOrLocalAddress(trimmedIp)) {
      log.warn("Private or local IP address provided: {}", trimmedIp);
      throw new InvalidIpAddressException(trimmedIp);
    }

    if (!isValidIpFormat(trimmedIp)) {
      log.warn("Invalid IP address format: {}", trimmedIp);
      throw new InvalidIpAddressException(trimmedIp);
    }
  }

  /** Checks if the IP address is in a valid format (IPv4 or IPv6). */
  private boolean isValidIpFormat(String ip) {
    return IPV4_PATTERN.matcher(ip).matches() || IPV6_PATTERN.matcher(ip).matches();
  }

  /** Checks if the IP address is private or local. */
  private boolean isPrivateOrLocalAddress(String ip) {
    return ip.startsWith("192.168.")
        || ip.startsWith("10.")
        || ip.startsWith("172.")
        || ip.equals("127.0.0.1")
        || ip.equals("localhost")
        || ip.equals("::1");
  }

  /** Retrieves IP data with retry logic. */
  private IpInfoDto retrieveWithRetry(String ip) throws IpGeoLocationServiceException {
    int attempts = 0;
    Exception lastException = null;

    while (attempts < maxRetryAttempts) {
      try {
        attempts++;
        log.debug("Attempting to retrieve IP data, attempt {} of {}", attempts, maxRetryAttempts);
        return performApiCall(ip);
      } catch (IntegrationTimeoutException | IpGeoLocationServiceException e) {
        lastException = e;
        if (attempts < maxRetryAttempts) {
          log.warn(
              "Attempt {} failed for IP {}, retrying... Error: {}", attempts, ip, e.getMessage());
          try {
            Thread.sleep(1000L * attempts);
          } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            throw new IpGeoLocationServiceException(ip, "Interrupted during retry");
          }
        } else {
          log.error("All {} attempts failed for IP: {}", maxRetryAttempts, ip);
        }
      }
    }

    // If we get here, all retries failed
    if (lastException instanceof IpGeoLocationServiceException) {
      throw (IpGeoLocationServiceException) lastException;
    } else {
      throw new IpGeoLocationServiceException(ip, lastException.getMessage());
    }
  }

  /** Performs the actual API call to retrieve IP information. */
  private IpInfoDto performApiCall(String ip)
      throws IpGeoLocationServiceException, IntegrationTimeoutException {
    try {
      String url =
          ipApiUrl + ip + "?fields=status,country,countryCode,region,regionName,city,zip,timezone";
      log.debug("Making API call to: {}", url);

      ResponseEntity<IpInfoDto> responseEntity = restTemplate.getForEntity(url, IpInfoDto.class);
      IpInfoDto response = responseEntity.getBody();

      if (response == null) {
        log.error("Received null response for IP: {}", ip);
        throw new IpGeoLocationServiceException(ip, "null response from API");
      }

      if (!"success".equals(response.status())) {
        log.error("API returned error status for IP {}: {}", ip, response.status());
        throw new IpGeoLocationServiceException(ip, "API returned status: " + response.status());
      }

      log.debug("Successfully retrieved IP data for: {} -> Country: {}", ip, response.country());
      return response;

    } catch (ResourceAccessException e) {
      log.error("Timeout occurred while retrieving IP data for: {}", ip);
      throw new IntegrationTimeoutException("IP Geolocation API", timeoutSeconds / 1000);

    } catch (RestClientException e) {
      log.error(
          "REST client error while retrieving IP data for: {}, error: {}", ip, e.getMessage());
      throw new IpGeoLocationServiceException(ip, e.getMessage());

    } catch (Exception e) {
      log.error("Unexpected error while retrieving IP data for: {}", ip, e);
      throw new IpGeoLocationServiceException(ip, "Unexpected error: " + e.getMessage());
    }
  }

  /** Creates a fallback response for private/local IP addresses. */
  public IpInfoDto createLocalIpResponse() {
    return new IpInfoDto(
        "success", "Local", "LOCAL", "Local Region", "Local Region", "Local City", "00000", "UTC");
  }
}