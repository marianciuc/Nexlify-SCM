package works.marianciuc.logistic_commerce.userservice.services;

import java.util.List;
import java.util.UUID;
import works.marianciuc.logistic_commerce.userservice.domain.dto.Page;
import works.marianciuc.logistic_commerce.userservice.domain.dto.UpdateUserDto;
import works.marianciuc.logistic_commerce.userservice.domain.dto.UserDto;
import works.marianciuc.logistic_commerce.userservice.domain.qfilters.UserSearchFilter;
import works.marianciuc.logistic_commerce.userservice.exceptions.user.UserNotFoundException;

public interface UserManagementService {
  UserDto getUserByEmail(String email) throws UserNotFoundException;

  UserDto getUserById(UUID id) throws UserNotFoundException;

  Page<List<UserDto>> searchUsers(UserSearchFilter filter);

  UserDto updateUser(UUID id, UpdateUserDto dto) throws UserNotFoundException;
}
