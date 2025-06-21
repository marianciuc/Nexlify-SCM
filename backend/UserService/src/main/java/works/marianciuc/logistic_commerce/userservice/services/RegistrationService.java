package works.marianciuc.logistic_commerce.userservice.services;

import works.marianciuc.logistic_commerce.userservice.domain.dto.RegistrationRequestDTO;
import works.marianciuc.logistic_commerce.userservice.domain.dto.UserDto;

@FunctionalInterface
public interface RegistrationService {

  /**
   * Registers a new user based on the provided registration request and returns the user's details.
   *
   * @param request the registration details encapsulated in a {@code RegistrationRequestDTO}
   *     object, containing necessary user information such as email, password, first name, last
   *     name, contact number, timezone, country, and other related data.
   * @return a {@code UserDto} object containing the details of the newly registered user, including
   *     their ID, email, name, contact details, roles, and account status.
   * @throws AuthException if the registration process fails due to authentication-related issues,
   *     such as invalid input data, failing data processing consent, or account conflicts.
   */
  UserDto register(RegistrationRequestDTO request) throws AuthException;
}
