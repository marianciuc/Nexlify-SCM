package works.marianciuc.logistic_commerce.userservice.controllers.impl;

import jakarta.security.auth.message.AuthException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import works.marianciuc.logistic_commerce.userservice.controllers.AuthController;
import works.marianciuc.logistic_commerce.userservice.domain.dto.CredentialsRequest;
import works.marianciuc.logistic_commerce.userservice.domain.dto.RefreshToken;
import works.marianciuc.logistic_commerce.userservice.domain.dto.RegistrationRequest;
import works.marianciuc.logistic_commerce.userservice.domain.dto.TokenPair;
import works.marianciuc.logistic_commerce.userservice.services.AuthService;
import works.marianciuc.logistic_commerce.userservice.services.RegistrationService;

@RestController
@RequiredArgsConstructor
@Slf4j
public class AuthControllerImpl implements AuthController {

  private final AuthService authService;
  private final RegistrationService registrationService;

  @Override
  public ResponseEntity<TokenPair> login(CredentialsRequest credentialsRequest) {
    return authService.login(credentialsRequest.email(), credentialsRequest.password());
  }

  @Override
  public ResponseEntity<TokenPair> refresh(RefreshToken refreshToken) {
    return authService.refresh(refreshToken.refreshToken());
  }

  @Override
  public ResponseEntity<Void> logout(RefreshToken refreshToken) {
    return authService.logout(refreshToken.refreshToken());
  }

  @Override
  public ResponseEntity<TokenPair> register(RegistrationRequest registrationRequest)
      throws AuthException {
    registrationService.register(registrationRequest);
    return login(
        new CredentialsRequest(registrationRequest.email(), registrationRequest.password()));
  }
}
