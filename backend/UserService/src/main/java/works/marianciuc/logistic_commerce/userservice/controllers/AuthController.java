package works.marianciuc.logistic_commerce.userservice.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import works.marianciuc.logistic_commerce.userservice.annotations.UserAccessValidation;
import works.marianciuc.logistic_commerce.userservice.domain.dto.CredentialsRequest;
import works.marianciuc.logistic_commerce.userservice.domain.dto.RefreshToken;
import works.marianciuc.logistic_commerce.userservice.domain.dto.RegistrationRequestDTO;
import works.marianciuc.logistic_commerce.userservice.domain.dto.TokenPair;
import works.marianciuc.logistic_commerce.userservice.domain.enums.Resource;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Authentication management endpoints")
public interface AuthController {

  @Operation(
      summary = "Authenticate user",
      description = "Authenticate user with credentials and return JWT token pair")
  @PostMapping("/login")
  @UserAccessValidation
  ResponseEntity<TokenPair> login(
      @Parameter(
              description = "User credentials",
              schema = @Schema(implementation = CredentialsRequest.class))
          @RequestBody
          CredentialsRequest credentialsRequest,
      @Parameter(description = "Resource type", schema = @Schema(implementation = Resource.class))
          @RequestParam
          Resource resource);

  @Operation(summary = "Refresh JWT token pair", description = "Refresh JWT token pair")
  @PostMapping("/refresh")
  ResponseEntity<TokenPair> refresh(
      @Parameter(
              description = "Refresh token",
              schema = @Schema(implementation = RefreshToken.class))
          @RequestBody
          RefreshToken refreshToken);

  @Operation(summary = "Logout user", description = "Logout user")
  @GetMapping("/logout")
  ResponseEntity<Void> logout();

  @Operation(summary = "Register user", description = "Register user with registration form")
  @PostMapping("/register")
  ResponseEntity<TokenPair> register(
      @Parameter(
              description = "Registration form",
              schema = @Schema(implementation = RegistrationRequestDTO.class))
          @RequestBody
          RegistrationRequestDTO registrationRequest);
}
