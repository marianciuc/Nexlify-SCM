package works.marianciuc.logistic_commerce.userservice.services.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import works.marianciuc.logistic_commerce.userservice.domain.dto.RegistrationRequest;
import works.marianciuc.logistic_commerce.userservice.domain.enums.Regions;
import works.marianciuc.logistic_commerce.userservice.domain.model.User;
import works.marianciuc.logistic_commerce.userservice.keycloak.service.UserManager;
import works.marianciuc.logistic_commerce.userservice.mappers.UserMapper;
import works.marianciuc.logistic_commerce.userservice.repositories.UserRepository;
import works.marianciuc.logistic_commerce.userservice.repositories.entity.UserEn;
import works.marianciuc.logistic_commerce.userservice.services.RegistrationService;

@Slf4j
@Service
@RequiredArgsConstructor
public class KeycloakRegistrationServiceImpl implements RegistrationService {

  private final UserManager userManager;
  private final UserRepository userRepository;
  private final UserMapper userMapper;

  @Override
  @Transactional
  public User register(RegistrationRequest request) {
    Regions region = Regions.valueOf(request.country().toUpperCase());

    UserEn user =
        UserEn.builder()
            .email(request.email())
            .firstName(request.firstName())
            .lastName(request.lastName())
            .contactNumber(request.contactNumber())
            .country(region)
            .dataProcessingConsent(request.dataProcessingConsent())
            .timezone(region.getTimezone().getID())
            .build();

    userRepository.save(user);

    String userId =
        userManager.createUser(
            user.getEmail(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            request.password(),
            true,
            false,
            user.getId().toString());

    userManager.assignRoleToUser(userId, request.role().name());
    return userMapper.toDto(user);
  }
}
