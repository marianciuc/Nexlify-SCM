package works.marianciuc.logistic_commerce.userservice.keycloak.service;

import works.marianciuc.logistic_commerce.userservice.domain.enums.SecurityScope;

public interface ScopeManager {
  void createScope(SecurityScope scope);

  void updateScope(SecurityScope scope);
}
