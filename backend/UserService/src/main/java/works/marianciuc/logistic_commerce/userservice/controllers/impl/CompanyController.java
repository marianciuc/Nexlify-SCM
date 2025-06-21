package works.marianciuc.logistic_commerce.userservice.controllers.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import works.marianciuc.logistic_commerce.userservice.domain.dto.CompanyDto;
import works.marianciuc.logistic_commerce.userservice.domain.dto.CreateCompanyRequest;
import works.marianciuc.logistic_commerce.userservice.domain.res.ApiResponse;
import works.marianciuc.logistic_commerce.userservice.factories.CompanyExecutorFactory;
import works.marianciuc.logistic_commerce.userservice.services.CompanyService;

@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
public class CompanyController {

  private final CompanyExecutorFactory companyExecutorFactory;
  private final CompanyService companyService;

  @PostMapping("/register")
  public ResponseEntity<ApiResponse<CompanyDto>> registerInSystem(
      @RequestBody CreateCompanyRequest request) {
    try {
      CompanyDto companyDto = companyService.createCompany(request);
      return ResponseEntity.ok(ApiResponse.success(companyDto));
    } catch (Exception exception) {
      return ResponseEntity.badRequest().body(ApiResponse.error(exception.getMessage()));
    }
  }

  @GetMapping("/exists")
  public ResponseEntity<ApiResponse<Boolean>> exists(
      @RequestParam(name = "country_code") String countryCode,
      @RequestParam(name = "tax_id") String taxId) {}

  @GetMapping("/company/{countryCode}/{taxId}")
  public ResponseEntity<ApiResponse<CompanyDto>> getCompany(
      @PathVariable String countryCode, @PathVariable String taxId) {
    try {

      return ResponseEntity.ok(
          ApiResponse.success(companyExecutorFactory.executeByCountry(countryCode, taxId)));
    } catch (Exception exception) {
      return ResponseEntity.badRequest().body(ApiResponse.error(exception.getMessage()));
    }
  }
}
