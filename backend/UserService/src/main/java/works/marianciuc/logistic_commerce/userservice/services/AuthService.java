package works.marianciuc.logistic_commerce.userservice.services;

import works.marianciuc.logistic_commerce.userservice.domain.dto.TokenPair;

public interface AuthService {
  TokenPair login(String username, String password);

  TokenPair refresh(String refreshToken);
}
