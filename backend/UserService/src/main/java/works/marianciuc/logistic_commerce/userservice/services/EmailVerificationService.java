package works.marianciuc.logistic_commerce.userservice.services;

public interface EmailVerificationService {
  void sendVerificationEmail(String email);

  void verifyEmail(String token);
}
