package works.marianciuc.logistic_commerce.userservice.keycloak.service;

import works.marianciuc.logistic_commerce.userservice.domain.enums.Role;

public interface RoleManager extends ScopeManager {
  void createRole(Role role);

  void updateRole(Role role);

  void validateAndFixRoleToScopeAssociation(Role role);

  boolean validateRole(String roleName);
}
