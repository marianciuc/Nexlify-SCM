package works.marianciuc.logistic_commerce.userservice.services;

import java.util.UUID;
import works.marianciuc.logistic_commerce.userservice.domain.dto.UpdateUserRequest;
import works.marianciuc.logistic_commerce.userservice.domain.dto.general.Page;
import works.marianciuc.logistic_commerce.userservice.domain.enums.Role;
import works.marianciuc.logistic_commerce.userservice.domain.model.User;
import works.marianciuc.logistic_commerce.userservice.domain.qfilters.UserSearchFilter;
import works.marianciuc.logistic_commerce.userservice.exceptions.user.UserNotFoundException;

public interface UserManagementService {
  User getUserByEmail(String email) throws UserNotFoundException;

  User getUserById(UUID id) throws UserNotFoundException;

  Page<User> searchUsers(UserSearchFilter filter);

  User updateUser(UUID id, UpdateUserRequest dto) throws UserNotFoundException;

  void updateOrChangeRole(UUID id, Role role);
}
