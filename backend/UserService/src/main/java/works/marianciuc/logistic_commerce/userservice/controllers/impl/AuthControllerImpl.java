package works.marianciuc.logistic_commerce.userservice.controllers.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import works.marianciuc.logistic_commerce.userservice.controllers.AuthController;
import works.marianciuc.logistic_commerce.userservice.domain.dto.CredentialsRequest;
import works.marianciuc.logistic_commerce.userservice.domain.dto.RefreshToken;
import works.marianciuc.logistic_commerce.userservice.domain.dto.RegistrationRequestDTO;
import works.marianciuc.logistic_commerce.userservice.domain.dto.TokenPair;
import works.marianciuc.logistic_commerce.userservice.domain.enums.Resource;
import works.marianciuc.logistic_commerce.userservice.services.AuthService;
import works.marianciuc.logistic_commerce.userservice.services.RegistrationService;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthControllerImpl implements AuthController {

  private final AuthService authService;
  private final RegistrationService registrationService;

  public ResponseEntity<TokenPair> login(CredentialsRequest credentialsRequest, Resource resource) {
    return authService.login(credentialsRequest.email(), credentialsRequest.password());
  }

  public ResponseEntity<TokenPair> refresh(RefreshToken refreshToken) {
    return authService.refresh(refreshToken.refreshToken());
  }

  public ResponseEntity<Void> logout(RefreshToken refreshToken) {
    return authService.logout(refreshToken.refreshToken());
  }

  public ResponseEntity<TokenPair> register(RegistrationRequestDTO registrationRequest) {
    return null;
  }
}
