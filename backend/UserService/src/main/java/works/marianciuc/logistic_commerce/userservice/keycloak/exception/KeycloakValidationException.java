package works.marianciuc.logistic_commerce.userservice.keycloak.exception;

import java.util.List;
import java.util.Map;
import lombok.Getter;

/**
 * Exception thrown when input validation fails for Keycloak operations. This includes invalid user
 * data, malformed requests, constraint violations, business rule violations, etc.
 */
@Getter
public class KeycloakValidationException extends KeycloakException {

  private static final String ERROR_CODE = "KEYCLOAK_VALIDATION_ERROR";
  private final String fieldName;
  private final Object fieldValue;
  private final String validationRule;
  private final Map<String, String> validationErrors;

  public KeycloakValidationException(String message, String fieldName) {
    super(message);
    this.fieldName = fieldName;
    this.fieldValue = null;
    this.validationRule = null;
    this.validationErrors = null;
  }

  public KeycloakValidationException(String message, String fieldName, Object fieldValue) {
    super(message);
    this.fieldName = fieldName;
    this.fieldValue = fieldValue;
    this.validationRule = null;
    this.validationErrors = null;
  }

  public KeycloakValidationException(
      String message, String fieldName, Object fieldValue, String validationRule) {
    super(message);
    this.fieldName = fieldName;
    this.fieldValue = fieldValue;
    this.validationRule = validationRule;
    this.validationErrors = null;
  }

  public KeycloakValidationException(String message, Map<String, String> validationErrors) {
    super(message);
    this.fieldName = null;
    this.fieldValue = null;
    this.validationRule = null;
    this.validationErrors = validationErrors;
  }

  public KeycloakValidationException(
      String message, String fieldName, Object fieldValue, Throwable cause) {
    super(message, cause);
    this.fieldName = fieldName;
    this.fieldValue = fieldValue;
    this.validationRule = null;
    this.validationErrors = null;
  }

  /** Creates an exception for required field validation. */
  public static KeycloakValidationException requiredField(String fieldName) {
    return new KeycloakValidationException(
        String.format("Required field '%s' is missing or empty", fieldName),
        fieldName,
        null,
        "required");
  }

  /** Creates an exception for invalid field format. */
  public static KeycloakValidationException invalidFormat(
      String fieldName, Object value, String expectedFormat) {
    return new KeycloakValidationException(
        String.format(
            "Field '%s' has invalid format. Value: '%s', Expected format: %s",
            fieldName, value, expectedFormat),
        fieldName,
        value,
        "format");
  }

  /** Creates an exception for field length validation. */
  public static KeycloakValidationException invalidLength(
      String fieldName, Object value, int minLength, int maxLength) {
    return new KeycloakValidationException(
        String.format(
            "Field '%s' length is invalid. Value: '%s', Expected length: %d-%d",
            fieldName, value, minLength, maxLength),
        fieldName,
        value,
        String.format("length(%d-%d)", minLength, maxLength));
  }

  /** Creates an exception for duplicate value validation. */
  public static KeycloakValidationException duplicateValue(String fieldName, Object value) {
    return new KeycloakValidationException(
        String.format("Field '%s' value '%s' already exists", fieldName, value),
        fieldName,
        value,
        "unique");
  }

  /** Creates an exception for invalid enum value. */
  public static KeycloakValidationException invalidEnumValue(
      String fieldName, Object value, List<String> validValues) {
    return new KeycloakValidationException(
        String.format(
            "Field '%s' has invalid value '%s'. Valid values: %s", fieldName, value, validValues),
        fieldName,
        value,
        "enum");
  }

  /** Creates an exception for business rule violations. */
  public static KeycloakValidationException businessRuleViolation(
      String ruleName, String description) {
    return new KeycloakValidationException(
        String.format("Business rule violation: %s. %s", ruleName, description),
        "businessRule",
        ruleName,
        "business");
  }

  /** Creates an exception for multiple validation errors. */
  public static KeycloakValidationException multipleErrors(Map<String, String> errors) {
    return new KeycloakValidationException(
        String.format("Multiple validation errors occurred: %d errors", errors.size()), errors);
  }

  /** Creates an exception for password validation. */
  public static KeycloakValidationException invalidPassword(String reason) {
    return new KeycloakValidationException(
        String.format("Password validation failed: %s", reason),
        "password",
        "[REDACTED]",
        "password-policy");
  }

  /** Creates an exception for email validation. */
  public static KeycloakValidationException invalidEmail(String email) {
    return new KeycloakValidationException(
        String.format("Invalid email format: %s", email), "email", email, "email-format");
  }

  @Override
  public String getErrorCode() {
    return ERROR_CODE;
  }

  @Override
  public String getErrorContext() {
    StringBuilder context = new StringBuilder();

    if (fieldName != null) {
      context.append("Field: ").append(fieldName);
      if (fieldValue != null) {
        context.append(", Value: ").append(fieldValue);
      }
      if (validationRule != null) {
        context.append(", Rule: ").append(validationRule);
      }
    }

    if (validationErrors != null && !validationErrors.isEmpty()) {
      context.append("Validation errors: ").append(validationErrors);
    }

    return context.toString();
  }
}
