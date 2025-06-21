package works.marianciuc.logistic_commerce.userservice.exceptions;

import io.swagger.v3.oas.annotations.Hidden;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import works.marianciuc.logistic_commerce.userservice.domain.dto.ErrorResponse;

@RestControllerAdvice
@Slf4j
@Hidden
public class GlobalExceptionHandler {

  @ExceptionHandler(RuntimeException.class)
  public ResponseEntity<ErrorResponse> handleException(RuntimeException e) {}

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
              String errorMessage = error.getDefaultMessage();
              errors.put(fieldName, errorMessage);
            });

    String errorMessage = "Validation failed: " + String.join(", ", errors.values());
    ErrorResponse errorResponse =
        new ErrorResponse(
            "VALIDATION_ERROR",
            errorMessage,
            HttpStatus.BAD_REQUEST.value(),
            LocalDateTime.now(ZoneOffset.UTC),
            request.getRequestURI());

    return ResponseEntity.status(errorResponse.status()).body(errorResponse);
  }
}
