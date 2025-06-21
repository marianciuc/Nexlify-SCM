package works.marianciuc.logistic_commerce.userservice.services.impl;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import works.marianciuc.logistic_commerce.userservice.domain.dto.Page;
import works.marianciuc.logistic_commerce.userservice.domain.dto.UpdateUserDto;
import works.marianciuc.logistic_commerce.userservice.domain.dto.UserDto;
import works.marianciuc.logistic_commerce.userservice.domain.entity.User;
import works.marianciuc.logistic_commerce.userservice.domain.qfilters.UserSearchFilter;
import works.marianciuc.logistic_commerce.userservice.exceptions.user.UserNotFoundException;
import works.marianciuc.logistic_commerce.userservice.repositories.UserRepository;
import works.marianciuc.logistic_commerce.userservice.services.UserManagementService;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserManagementServiceImpl implements UserManagementService {

  private final UserRepository userRepository;

  @Override
  public UserDto getUserByEmail(String email) throws UserNotFoundException {
    User user = User.builder().email(email).build();
    return null;
  }

  @Override
  public UserDto getUserById(UUID id) throws UserNotFoundException {
    return null;
  }

  @Override
  public Page<List<UserDto>> searchUsers(UserSearchFilter filter) {
    return null;
  }

  @Override
  public UserDto updateUser(UUID id, UpdateUserDto dto) throws UserNotFoundException {
    return null;
  }
}
