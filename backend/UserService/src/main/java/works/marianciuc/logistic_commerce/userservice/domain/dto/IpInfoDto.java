package works.marianciuc.logistic_commerce.userservice.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record IpInfoDto(
    String status,
    String country,
    String countryCode,
    String region,
    String regionName,
    String city,
    String zip,
    String timezone) {}
