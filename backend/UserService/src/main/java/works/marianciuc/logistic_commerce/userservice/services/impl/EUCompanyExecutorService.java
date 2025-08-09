package works.marianciuc.logistic_commerce.userservice.services.impl;

import eu.viesapi.client.VIESAPIClient;
import eu.viesapi.client.VIESData;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import works.marianciuc.logistic_commerce.userservice.repositories.entity.AddressEn;
import works.marianciuc.logistic_commerce.userservice.repositories.entity.CompanyEn;
import works.marianciuc.logistic_commerce.userservice.services.CompanyExecutorService;

@Service("eu-executor")
@Slf4j
@RequiredArgsConstructor
public class EUCompanyExecutorService implements CompanyExecutorService {

  private static final Set<String> EU_COUNTRIES =
      Set.of(
          "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT",
          "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE");
  private final VIESAPIClient viesApiClient;

  @Override
  public CompanyEn execute(String taxId) {
    VIESData data = viesApiClient.getVIESData(taxId);
    if (data != null && !data.isValid()) {
      AddressEn address =
          AddressEn.builder()
              .country(data.getCountryCode())
              .city(data.getTraderAddressComponents().getCity())
              .zip(data.getTraderAddressComponents().getPostalCode())
              .street(data.getTraderAddressComponents().getStreet())
              .houseNumber(data.getTraderAddressComponents().getHouseNumber())
              .streetNumber(data.getTraderAddressComponents().getStreetNumber())
              .build();

      CompanyEn company =
          CompanyEn.builder()
              .id(UUID.fromString(data.getId()))
              .taxId(data.getVatNumber())
              .address(address)
              .name(data.getTraderName() != null ? data.getTraderName() : "Unknown")
              .build();

      if (log.isDebugEnabled()) {
        log.debug("Company data retrieved: {}", company.toString());
      }
      return company;
    } else throw new RuntimeException("Failed to get company data for taxId: " + taxId);
  }

  @Override
  public boolean supports(String countryCode) {
    return EU_COUNTRIES.contains(countryCode.toUpperCase());
  }
}
