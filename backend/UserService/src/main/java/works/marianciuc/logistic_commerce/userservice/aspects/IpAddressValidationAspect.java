package works.marianciuc.logistic_commerce.userservice.aspects;

import lombok.RequiredArgsConstructor;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
public class IpAddressValidationAspect {
  // @Before("@annotation(ipAddressValidation) && args(credentials, resource, ..)")
}
