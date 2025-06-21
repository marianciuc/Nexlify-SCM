package works.marianciuc.logistic_commerce.userservice.exceptions;

import io.swagger.v3.oas.annotations.Hidden;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.server.resource.InvalidBearerTokenException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import works.marianciuc.logistic_commerce.userservice.domain.dto.ErrorResponse;
import works.marianciuc.logistic_commerce.userservice.exceptions.general.BusinessException;
import works.marianciuc.logistic_commerce.userservice.exceptions.general.ForbiddenException;
import works.marianciuc.logistic_commerce.userservice.exceptions.general.UnauthorizedException;
import works.marianciuc.logistic_commerce.userservice.exceptions.security.*;

@RestControllerAdvice
@Slf4j
@Hidden
@RequiredArgsConstructor
public class GlobalExceptionHandler {

  private final MessageSource messageSource;

  /** Handle all custom business exceptions */
  @ExceptionHandler(BusinessException.class)
  public ResponseEntity<ErrorResponse> handleBusinessException(
      BusinessException ex, HttpServletRequest request) {
    log.warn("Business exception occurred: {}", ex.getMessage());

    String localizedMessage = getLocalizedMessage(ex.getMessage(), ex.getArgs());
    ErrorResponse errorResponse =
        createErrorResponse(
            ex.getErrorCode(), localizedMessage, ex.getStatus().value(), request.getRequestURI());

    return ResponseEntity.status(ex.getStatus()).body(errorResponse);
  }

  /** Handle Spring Security Authentication exceptions */
  @ExceptionHandler({
    AuthenticationException.class,
    BadCredentialsException.class,
    InsufficientAuthenticationException.class
  })
  public ResponseEntity<ErrorResponse> handleAuthenticationException(
      AuthenticationException ex, HttpServletRequest request) {
    log.warn("Authentication exception: {}", ex.getMessage());

    String message = getLocalizedMessage("errors.security.authentication.failed");
    ErrorResponse errorResponse =
        createErrorResponse(
            "AUTHENTICATION_FAILED",
            message,
            HttpStatus.UNAUTHORIZED.value(),
            request.getRequestURI());

    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
  }

  /** Handle Spring Security Access Denied exceptions */
  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccessDeniedException(
      AccessDeniedException ex, HttpServletRequest request) {
    log.warn("Access denied: {}", ex.getMessage());

    String message = getLocalizedMessage("errors.security.access_denied");
    ErrorResponse errorResponse =
        createErrorResponse(
            "ACCESS_DENIED", message, HttpStatus.FORBIDDEN.value(), request.getRequestURI());

    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
  }

  /** Handle JWT Bearer Token exceptions */
  @ExceptionHandler(InvalidBearerTokenException.class)
  public ResponseEntity<ErrorResponse> handleInvalidBearerTokenException(
      InvalidBearerTokenException ex, HttpServletRequest request) {
    log.warn("Invalid bearer token: {}", ex.getMessage());

    String message = getLocalizedMessage("errors.security.token.invalid");
    ErrorResponse errorResponse =
        createErrorResponse(
            "INVALID_BEARER_TOKEN",
            message,
            HttpStatus.UNAUTHORIZED.value(),
            request.getRequestURI());

    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
  }

  /** Handle custom security exceptions */
  @ExceptionHandler({
    ExpiredJwtTokenException.class,
    InvalidJwtTokenException.class,
    MissingAuthenticationException.class,
    SessionExpiredException.class,
    RateLimitExceededException.class
  })
  public ResponseEntity<ErrorResponse> handleUnauthorizedSecurityException(
      UnauthorizedException ex, HttpServletRequest request) {
    log.warn("Security unauthorized exception: {}", ex.getMessage());

    String localizedMessage = getLocalizedMessage(ex.getMessage(), ex.getArgs());
    ErrorResponse errorResponse =
        createErrorResponse(
            ex.getErrorCode(), localizedMessage, ex.getStatus().value(), request.getRequestURI());

    return ResponseEntity.status(ex.getStatus()).body(errorResponse);
  }

  /** Handle forbidden security exceptions */
  @ExceptionHandler({
    InsufficientPermissionsException.class,
    AccountSuspendedException.class,
    IpAddressBlockedException.class,
    SuspiciousActivityException.class
  })
  public ResponseEntity<ErrorResponse> handleForbiddenSecurityException(
      ForbiddenException ex, HttpServletRequest request) {
    log.warn("Security forbidden exception: {}", ex.getMessage());

    String localizedMessage = getLocalizedMessage(ex.getMessage(), ex.getArgs());
    ErrorResponse errorResponse =
        createErrorResponse(
            ex.getErrorCode(), localizedMessage, ex.getStatus().value(), request.getRequestURI());

    return ResponseEntity.status(ex.getStatus()).body(errorResponse);
  }

  /** Handle validation exceptions */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidationException(
      MethodArgumentNotValidException ex, HttpServletRequest request) {
    log.warn("Validation failed: {}", ex.getMessage());

    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult()
        .getAllErrors()
        .forEach(
            error -> {
              String fieldName = ((FieldError) error).getField();
              String errorMessage = getLocalizedMessage(error.getDefaultMessage());
              errors.put(fieldName, errorMessage);
            });

    String errorMessage =
        getLocalizedMessage("errors.validation.failed", String.join(", ", errors.values()));
    ErrorResponse errorResponse =
        createErrorResponse(
            "VALIDATION_ERROR",
            errorMessage,
            HttpStatus.BAD_REQUEST.value(),
            request.getRequestURI());

    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
  }

  /** Handle all other runtime exceptions */
  @ExceptionHandler(RuntimeException.class)
  public ResponseEntity<ErrorResponse> handleRuntimeException(
      RuntimeException ex, HttpServletRequest request) {
    log.error("Unexpected runtime exception occurred", ex);

    String message = getLocalizedMessage("errors.system.internal");
    ErrorResponse errorResponse =
        createErrorResponse(
            "INTERNAL_SERVER_ERROR",
            message,
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            request.getRequestURI());

    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
  }

  /** Handle generic exceptions */
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGenericException(
      Exception ex, HttpServletRequest request) {
    log.error("Unexpected exception occurred", ex);

    String message = getLocalizedMessage("errors.system.internal");
    ErrorResponse errorResponse =
        createErrorResponse(
            "INTERNAL_SERVER_ERROR",
            message,
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            request.getRequestURI());

    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
  }

  private ErrorResponse createErrorResponse(
      String errorCode, String message, int status, String path) {
    return new ErrorResponse(errorCode, message, status, LocalDateTime.now(ZoneOffset.UTC), path);
  }

  private String getLocalizedMessage(String messageKey, String... args) {
    try {
      return messageSource.getMessage(messageKey, args, LocaleContextHolder.getLocale());
    } catch (Exception e) {
      log.warn("Failed to resolve message key: {}", messageKey);
      return messageKey;
    }
  }
}
