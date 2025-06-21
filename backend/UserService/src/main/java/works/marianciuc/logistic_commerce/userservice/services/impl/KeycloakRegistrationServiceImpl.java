package works.marianciuc.logistic_commerce.userservice.services.impl;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;
import java.util.Collections;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import works.marianciuc.logistic_commerce.userservice.domain.dto.RegistrationRequestDTO;
import works.marianciuc.logistic_commerce.userservice.domain.dto.UserDto;
import works.marianciuc.logistic_commerce.userservice.domain.entity.User;
import works.marianciuc.logistic_commerce.userservice.domain.enums.Regions;
import works.marianciuc.logistic_commerce.userservice.exceptions.user.UserAlreadyExistException;
import works.marianciuc.logistic_commerce.userservice.repositories.UserRepository;
import works.marianciuc.logistic_commerce.userservice.services.RegistrationService;

@Slf4j
@Service
@RequiredArgsConstructor
public class KeycloakRegistrationServiceImpl implements RegistrationService {

  private final Keycloak keycloak;
  private final UserRepository userRepository;

  @Value("${keycloak.admin.realm}")
  private String realm;

  @Override
  @Transactional
  public UserDto register(RegistrationRequestDTO request) {
    validateUser(request);

    Regions region = Regions.valueOf(request.country().toUpperCase());

    User user =
        User.builder()
            .email(request.email())
            .firstName(request.firstName())
            .lastName(request.lastName())
            .contactNumber(request.contactNumber())
            .country(region)
            .dataProcessingConsent(request.dataProcessingConsent())
            .systemRole(request.systemRole())
            .companyRole(request.companyRole())
            .timezone(region.getTimezone().getID())
            .build();

    userRepository.save(user);

    UserRepresentation userRepresentation =
        createUserRepresentation(user, createCredentialRepresentation(request));

    try (Response response = keycloak.realm(realm).users().create(userRepresentation)) {
      if (response.getStatus() == 201) {
        return UserDto.fromEntity(user);
      }
      throw new RuntimeException("Unexpected response status: " + response.getStatus());
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  private void validateUser(RegistrationRequestDTO request) throws UserAlreadyExistException {
    if (!keycloak.realm(realm).users().search(request.email()).isEmpty()) {
      throw new UserAlreadyExistException();
    }
  }

  private CredentialRepresentation createCredentialRepresentation(RegistrationRequestDTO request) {
    CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
    credentialRepresentation.setType(CredentialRepresentation.PASSWORD);
    credentialRepresentation.setValue(request.password());
    credentialRepresentation.setTemporary(false);
    return credentialRepresentation;
  }

  private UserRepresentation createUserRepresentation(
      User user, CredentialRepresentation credentialRepresentation) {
    log.debug("KeycloakRegistrationServiceImpl::createUserRepresentation called {}", user);

    UserRepresentation userRepresentation = new UserRepresentation();

    userRepresentation.setId(user.getId().toString());
    userRepresentation.setEmail(user.getEmail());
    userRepresentation.setFirstName(user.getFirstName());
    userRepresentation.setLastName(user.getLastName());
    userRepresentation.setEmailVerified(false);
    userRepresentation.setEnabled(true);
    userRepresentation.setCredentials(Collections.singletonList(credentialRepresentation));

    return userRepresentation;
  }
}
