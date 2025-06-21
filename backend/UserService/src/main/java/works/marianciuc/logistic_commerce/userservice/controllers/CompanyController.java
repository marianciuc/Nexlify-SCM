package works.marianciuc.logistic_commerce.userservice.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import works.marianciuc.logistic_commerce.userservice.domain.dto.CompanyDto;
import works.marianciuc.logistic_commerce.userservice.domain.dto.CompanyListObject;
import works.marianciuc.logistic_commerce.userservice.domain.dto.CreateCompanyRequest;
import works.marianciuc.logistic_commerce.userservice.domain.dto.Page;
import works.marianciuc.logistic_commerce.userservice.domain.qfilters.CompanySearchFilter;

@RestController
@RequestMapping("/api/v1/companies")
@Tag(name = "Companies", description = "Companies management controller")
public interface CompanyController {

  @Operation(summary = "Register company", description = "Register company in the system")
  @PostMapping
  ResponseEntity<CompanyDto> registerInSystem(
      @Schema(
              description = "Company registration form",
              implementation = CreateCompanyRequest.class)
          @RequestBody
          CreateCompanyRequest request);

  @Operation(summary = "Exists in system", description = "Check if company exists in the system")
  @GetMapping("/exists")
  ResponseEntity<Boolean> exists(
      @Schema(
              description = "Country code in format ISO-4233",
              example = "IT",
              requiredMode = Schema.RequiredMode.REQUIRED)
          @RequestParam(name = "country_code")
          String countryCode,
      @Schema(
              description = "Company tax id",
              example = "123456789",
              requiredMode = Schema.RequiredMode.REQUIRED)
          @RequestParam(name = "tax_id")
          String taxId);

  @Operation(summary = "Get company by id", description = "Get company by id")
  @GetMapping("/{id}")
  ResponseEntity<CompanyDto> getCompany(
      @Schema(
              description = "Company id",
              example = "123e4567-e89b-12d3-a456-426655440000",
              requiredMode = Schema.RequiredMode.REQUIRED)
          @PathVariable
          UUID id);

  @Operation(
      summary = "Search companies",
      description = "Search companies with filters",
      tags = {"Search", "Companies"})
  @GetMapping("/search")
  ResponseEntity<Page<CompanyListObject>> searchCompanies(
      @ModelAttribute CompanySearchFilter companySearchFilter);
}
