package works.marianciuc.logistic_commerce.userservice.integrations;

import works.marianciuc.logistic_commerce.userservice.domain.dto.IpInfoDto;

/**
 * Interface for retrieving geographical information based on IP addresses. Implementations of this
 * interface should handle the communication with IP geolocation services.
 */
@FunctionalInterface
public interface IpInfoProvider {

  /**
   * Retrieves geographical information for the given IP address.
   *
   * @param ip The IP address to lookup, in string format (e.g., "192.168.1.1")
   * @return An {@link IpInfoDto} containing the geographical information
   * @throws IllegalArgumentException if the IP address is invalid
   * @throws RuntimeException if the service fails to retrieve the IP data
   */
  IpInfoDto retrieveIpData(String ip);
}
