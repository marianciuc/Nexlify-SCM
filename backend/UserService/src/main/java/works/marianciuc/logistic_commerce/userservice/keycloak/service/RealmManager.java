package works.marianciuc.logistic_commerce.userservice.keycloak.service;

public interface RealmManager {
  void createRealm(String realm);

  void deleteRealm(String realm);
}
