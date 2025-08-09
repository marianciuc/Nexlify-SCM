package works.marianciuc.logistic_commerce.userservice.services.impl;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import works.marianciuc.logistic_commerce.userservice.domain.dto.UpdateUserRequest;
import works.marianciuc.logistic_commerce.userservice.domain.dto.general.Page;
import works.marianciuc.logistic_commerce.userservice.domain.enums.Role;
import works.marianciuc.logistic_commerce.userservice.domain.model.User;
import works.marianciuc.logistic_commerce.userservice.domain.qfilters.UserSearchFilter;
import works.marianciuc.logistic_commerce.userservice.exceptions.user.UserNotFoundException;
import works.marianciuc.logistic_commerce.userservice.keycloak.service.UserManager;
import works.marianciuc.logistic_commerce.userservice.repositories.UserRepository;
import works.marianciuc.logistic_commerce.userservice.repositories.entity.UserEn;
import works.marianciuc.logistic_commerce.userservice.services.UserManagementService;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserManagementServiceImpl implements UserManagementService {

  private final UserRepository userRepository;
  private final UserManager userManager;

  @Override
  public User getUserByEmail(String email) throws UserNotFoundException {
    UserEn user = UserEn.builder().email(email).build();
    return null;
  }

  @Override
  public User getUserById(UUID id) throws UserNotFoundException {
    return null;
  }

  @Override
  public Page<User> searchUsers(UserSearchFilter filter) {
    return null;
  }

  @Override
  public User updateUser(UUID id, UpdateUserRequest dto) throws UserNotFoundException {
    return null;
  }

  @Override
  public void updateOrChangeRole(UUID id, Role role) throws UserNotFoundException {
    UserEn user = userRepository.findById(id).orElseThrow(UserNotFoundException::new);
    // When this method is implemented, it should use userManager to update the user's role in
    // Keycloak
  }
}
