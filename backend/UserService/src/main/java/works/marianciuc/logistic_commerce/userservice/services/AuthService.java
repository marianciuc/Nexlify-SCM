package works.marianciuc.logistic_commerce.userservice.services;

import org.springframework.http.ResponseEntity;
import works.marianciuc.logistic_commerce.userservice.domain.dto.TokenPair;

/**
 * Service interface for authentication-related operations for the application. This service handles
 * user login, token refresh, and logout functionalities.
 */
public interface AuthService {
  /**
   * Authenticates a user with the provided username and password, returning a pair of access and
   * refresh tokens on successful login.
   *
   * @param username the username or email of the user attempting to authenticate
   * @param password the password associated with the given username
   * @return a {@code ResponseEntity} containing a {@code TokenPair} object that includes the access
   *     token, refresh token, and expiration time for the access token
   */
  ResponseEntity<TokenPair> login(String username, String password);

  /**
   * Refreshes an access token using the provided refresh token. This method generates a new pair of
   * access and refresh tokens if the provided refresh token is valid and not expired.
   *
   * @param refreshToken the token used to request a new access token, typically obtained during
   *     initial authentication or a prior token refresh.
   * @return a {@code ResponseEntity} containing a {@code TokenPair} object, which includes the new
   *     access token, a new refresh token, and the expiration time for the access token.
   */
  ResponseEntity<TokenPair> refresh(String refreshToken);

  /**
   * Logs the currently authenticated user out of the system, invalidating their active session or
   * tokens. This effectively prevents further authorized access using the current credentials or
   * session information.
   *
   * @return a {@code ResponseEntity<Void>} indicating the success or failure of the logout
   *     operation. If successful, the entity body is empty.
   */
  ResponseEntity<Void> logout();
}
