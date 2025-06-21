package works.marianciuc.logistic_commerce.userservice.controllers.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import works.marianciuc.logistic_commerce.userservice.annotations.IpAddressValidation;
import works.marianciuc.logistic_commerce.userservice.annotations.RegistrationAspect;
import works.marianciuc.logistic_commerce.userservice.annotations.UserAccessValidation;
import works.marianciuc.logistic_commerce.userservice.domain.dto.CredentialsRequest;
import works.marianciuc.logistic_commerce.userservice.domain.dto.RegistrationRequestDTO;
import works.marianciuc.logistic_commerce.userservice.domain.dto.TokenPair;
import works.marianciuc.logistic_commerce.userservice.domain.enums.Resource;
import works.marianciuc.logistic_commerce.userservice.domain.res.ApiResponse;
import works.marianciuc.logistic_commerce.userservice.services.AuthService;
import works.marianciuc.logistic_commerce.userservice.services.RegistrationService;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

  private final AuthService authService;
  private final RegistrationService registrationService;

  @PostMapping("/login")
  @UserAccessValidation
  public ResponseEntity<ApiResponse<TokenPair>> login(
      @RequestBody CredentialsRequest credentials, @RequestParam Resource resource) {
    try {
      TokenPair tokenPair = authService.login(credentials.email(), credentials.password());
      return ResponseEntity.ok(ApiResponse.success(tokenPair));
    } catch (AuthException authException) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(ApiResponse.error(authException.getMessage()));
    } catch (Exception e) {
      log.error("Login error for email: {}", credentials.email(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("An unexpected error occurred"));
    }
  }

  @PostMapping("/refresh")
  public ResponseEntity<ApiResponse<TokenPair>> refresh(@RequestBody String refreshToken) {
    try {
      TokenPair tokenPair = authService.refresh(refreshToken);
      return ResponseEntity.ok(ApiResponse.success(tokenPair));
    } catch (AuthException authException) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(ApiResponse.error(authException.getMessage()));
    } catch (Exception e) {
      log.error("Refresh error for token: {}", refreshToken, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("An unexpected error occurred"));
    }
  }

  @GetMapping("/logout")
  public ResponseEntity<ApiResponse<Void>> logout() {
    return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).build();
  }

  @PostMapping("/register")
  @IpAddressValidation
  @RegistrationAspect
  public ResponseEntity<ApiResponse<TokenPair>> register(
      @RequestBody RegistrationRequestDTO registrationRequestDTO) {
    try {
      registrationService.register(registrationRequestDTO);
      TokenPair tokenPair =
          authService.login(registrationRequestDTO.email(), registrationRequestDTO.password());
      return ResponseEntity.ok(ApiResponse.success(tokenPair));
    } catch (AuthException authException) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(ApiResponse.error(authException.getMessage()));
    } catch (Exception e) {
      log.error("Register error for email: {}", registrationRequestDTO.email(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("An unexpected error occurred"));
    }
  }
}
