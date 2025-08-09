package works.marianciuc.logistic_commerce.userservice.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Arrays;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import works.marianciuc.logistic_commerce.userservice.domain.enums.SecurityScope;

@RestController
@RequestMapping("/api/security-scopes")
@Tag(name = "Security Scopes", description = "Operations for retrieving available security scopes")
public class SecurityScopeController {

  @GetMapping
  @Operation(
      summary = "Get all available security scopes",
      description =
          "Returns a list of all available security scopes in the system. "
              + "These scopes define various permissions that can be granted to users.")
  @ApiResponse(
      responseCode = "200",
      description = "Successfully retrieved security scopes",
      content =
          @Content(
              mediaType = "application/json",
              schema = @Schema(type = "array", implementation = SecurityScope.class)))
  public ResponseEntity<List<SecurityScope>> getAllSecurityScopes() {
    return ResponseEntity.ok(Arrays.asList(SecurityScope.values()));
  }
}
