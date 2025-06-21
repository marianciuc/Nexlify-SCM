package works.marianciuc.logistic_commerce.userservice.aspects;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class ControllerLoggingAspect {

  @Around("within(@org.springframework.stereotype.Controller *)")
  public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
    long startTime = System.currentTimeMillis();

    String methodName = joinPoint.getSignature().getName();
    String className = joinPoint.getTarget().getClass().getSimpleName();

    log.debug("Starting execution of {}.{}", className, methodName);

    try {
      Object result = joinPoint.proceed();

      long executionTime = System.currentTimeMillis() - startTime;
      log.debug("{}.{} executed in {} ms", className, methodName, executionTime);

      return result;
    } catch (Throwable t) {
      log.error("Error in {}.{}: {}", className, methodName, t.getMessage());
      throw t;
    }
  }
}
