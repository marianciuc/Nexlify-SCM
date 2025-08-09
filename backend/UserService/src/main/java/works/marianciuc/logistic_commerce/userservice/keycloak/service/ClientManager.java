package works.marianciuc.logistic_commerce.userservice.keycloak.service;

public interface ClientManager {
  void createClient();

  void clientExists();

  void deleteClient();
}
