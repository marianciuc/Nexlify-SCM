package works.marianciuc.logistic_commerce.userservice.controllers.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import works.marianciuc.logistic_commerce.userservice.domain.dto.requests.CreateCompanyRequest;
import works.marianciuc.logistic_commerce.userservice.domain.model.Company;
import works.marianciuc.logistic_commerce.userservice.domain.res.ApiResponse;
import works.marianciuc.logistic_commerce.userservice.factories.CompanyExecutorFactory;
import works.marianciuc.logistic_commerce.userservice.services.CompanyService;

@RestController
@RequiredArgsConstructor
public class CompanyController {

  private final CompanyExecutorFactory companyExecutorFactory;
  private final CompanyService companyService;

  public ResponseEntity<ApiResponse<Company>> registerInSystem(
      @RequestBody CreateCompanyRequest request) {
    try {
      Company company = companyService.createCompany(request);
      return ResponseEntity.ok(ApiResponse.success(company));
    } catch (Exception exception) {
      return ResponseEntity.badRequest().body(ApiResponse.error(exception.getMessage()));
    }
  }

  @GetMapping("/exists")
  public ResponseEntity<ApiResponse<Boolean>> exists(
      @RequestParam(name = "country_code") String countryCode,
      @RequestParam(name = "tax_id") String taxId) {
    return null;
  }

  @GetMapping("/company/{countryCode}/{taxId}")
  public ResponseEntity<ApiResponse<Company>> getCompany(
      @PathVariable String countryCode, @PathVariable String taxId) {
    try {

      return ResponseEntity.ok(
          ApiResponse.success(companyExecutorFactory.executeByCountry(countryCode, taxId)));
    } catch (Exception exception) {
      return ResponseEntity.badRequest().body(ApiResponse.error(exception.getMessage()));
    }
  }
}
