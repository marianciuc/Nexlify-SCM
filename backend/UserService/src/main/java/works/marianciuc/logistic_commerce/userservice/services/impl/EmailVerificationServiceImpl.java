package works.marianciuc.logistic_commerce.userservice.services.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import works.marianciuc.logistic_commerce.userservice.services.EmailVerificationService;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailVerificationServiceImpl implements EmailVerificationService {

  @Override
  public void sendVerificationEmail(String email) {}

  @Override
  public void verifyEmail(String token) {}
}
