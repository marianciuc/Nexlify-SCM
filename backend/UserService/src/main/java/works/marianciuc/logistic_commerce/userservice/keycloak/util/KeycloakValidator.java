package works.marianciuc.logistic_commerce.userservice.keycloak.util;

import java.util.*;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import works.marianciuc.logistic_commerce.userservice.keycloak.exception.KeycloakValidationException;

/**
 * Utility class for validating input data for Keycloak operations. Provides standardized validation
 * methods with consistent error handling.
 */
@Slf4j
@Component
public class KeycloakValidator {

  // Common validation patterns
  private static final Pattern EMAIL_PATTERN =
      Pattern.compile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");

  private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9._-]{3,50}$");

  private static final Pattern REALM_NAME_PATTERN = Pattern.compile("^[a-zA-Z0-9._-]{1,36}$");

  private static final Pattern CLIENT_ID_PATTERN = Pattern.compile("^[a-zA-Z0-9._-]{1,255}$");

  private static final Pattern ROLE_NAME_PATTERN = Pattern.compile("^[a-zA-Z0-9._-]{1,255}$");

  // Password requirements
  private static final int MIN_PASSWORD_LENGTH = 8;
  private static final int MAX_PASSWORD_LENGTH = 128;

  /**
   * Validates that a string field is not null or empty.
   *
   * @param fieldName the name of the field being validated
   * @param value the value to validate
   * @throws KeycloakValidationException if validation fails
   */
  public void validateRequired(String fieldName, String value) {
    if (!StringUtils.hasText(value)) {
      throw KeycloakValidationException.requiredField(fieldName);
    }
  }

  /**
   * Validates that an object field is not null.
   *
   * @param fieldName the name of the field being validated
   * @param value the value to validate
   * @throws KeycloakValidationException if validation fails
   */
  public void validateRequired(String fieldName, Object value) {
    if (value == null) {
      throw KeycloakValidationException.requiredField(fieldName);
    }
  }

  /**
   * Validates email format.
   *
   * @param email the email to validate
   * @throws KeycloakValidationException if validation fails
   */
  public void validateEmail(String email) {
    validateRequired("email", email);

    if (!EMAIL_PATTERN.matcher(email.trim()).matches()) {
      throw KeycloakValidationException.invalidEmail(email);
    }
  }

  /**
   * Validates username format and length.
   *
   * @param username the username to validate
   * @throws KeycloakValidationException if validation fails
   */
  public void validateUsername(String username) {
    validateRequired("username", username);

    String trimmed = username.trim();
    if (!USERNAME_PATTERN.matcher(trimmed).matches()) {
      throw KeycloakValidationException.invalidFormat(
          "username",
          username,
          "3-50 characters, alphanumeric, dots, underscores, and hyphens only");
    }
  }

  /**
   * Validates password strength and format.
   *
   * @param password the password to validate
   * @throws KeycloakValidationException if validation fails
   */
  public void validatePassword(String password) {
    validateRequired("password", password);

    if (password.length() < MIN_PASSWORD_LENGTH || password.length() > MAX_PASSWORD_LENGTH) {
      throw KeycloakValidationException.invalidLength(
          "password", "[REDACTED]", MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH);
    }

    // Check for basic password requirements
    boolean hasLower = password.chars().anyMatch(Character::isLowerCase);
    boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
    boolean hasDigit = password.chars().anyMatch(Character::isDigit);
    boolean hasSpecial =
        password.chars().anyMatch(ch -> "!@#$%^&*()_+-=[]{}|;:,.<>?".indexOf(ch) >= 0);

    List<String> missingRequirements = new ArrayList<>();
    if (!hasLower) missingRequirements.add("lowercase letter");
    if (!hasUpper) missingRequirements.add("uppercase letter");
    if (!hasDigit) missingRequirements.add("digit");
    if (!hasSpecial) missingRequirements.add("special character");

    if (!missingRequirements.isEmpty()) {
      throw KeycloakValidationException.invalidPassword(
          "Password must contain at least one: " + String.join(", ", missingRequirements));
    }
  }

  /**
   * Validates realm name format.
   *
   * @param realmName the realm name to validate
   * @throws KeycloakValidationException if validation fails
   */
  public void validateRealmName(String realmName) {
    validateRequired("realmName", realmName);

    String trimmed = realmName.trim();
    if (!REALM_NAME_PATTERN.matcher(trimmed).matches()) {
      throw KeycloakValidationException.invalidFormat(
          "realmName",
          realmName,
          "1-36 characters, alphanumeric, dots, underscores, and hyphens only");
    }
  }

  /**
   * Validates client ID format.
   *
   * @param clientId the client ID to validate
   * @throws KeycloakValidationException if validation fails
   */
  public void validateClientId(String clientId) {
    validateRequired("clientId", clientId);

    String trimmed = clientId.trim();
    if (!CLIENT_ID_PATTERN.matcher(trimmed).matches()) {
      throw KeycloakValidationException.invalidFormat(
          "clientId",
          clientId,
          "1-255 characters, alphanumeric, dots, underscores, and hyphens only");
    }
  }

  /**
   * Validates role name format.
   *
   * @param roleName the role name to validate
   * @throws KeycloakValidationException if validation fails
   */
  public void validateRoleName(String roleName) {
    validateRequired("roleName", roleName);

    String trimmed = roleName.trim();
    if (!ROLE_NAME_PATTERN.matcher(trimmed).matches()) {
      throw KeycloakValidationException.invalidFormat(
          "roleName",
          roleName,
          "1-255 characters, alphanumeric, dots, underscores, and hyphens only");
    }
  }

  /**
   * Validates string length.
   *
   * @param fieldName the name of the field being validated
   * @param value the value to validate
   * @param minLength minimum allowed length
   * @param maxLength maximum allowed length
   * @throws KeycloakValidationException if validation fails
   */
  public void validateLength(String fieldName, String value, int minLength, int maxLength) {
    validateRequired(fieldName, value);

    int length = value.trim().length();
    if (length < minLength || length > maxLength) {
      throw KeycloakValidationException.invalidLength(fieldName, value, minLength, maxLength);
    }
  }

  /**
   * Validates that a value is one of the allowed enum values.
   *
   * @param fieldName the name of the field being validated
   * @param value the value to validate
   * @param enumClass the enum class containing valid values
   * @param <E> the enum type
   * @throws KeycloakValidationException if validation fails
   */
  public <E extends Enum<E>> void validateEnum(String fieldName, String value, Class<E> enumClass) {
    validateRequired(fieldName, value);

    try {
      Enum.valueOf(enumClass, value.toUpperCase());
    } catch (IllegalArgumentException e) {
      List<String> validValues =
          Arrays.stream(enumClass.getEnumConstants()).map(Enum::name).toList();
      throw KeycloakValidationException.invalidEnumValue(fieldName, value, validValues);
    }
  }

  /**
   * Validates that a collection is not null or empty.
   *
   * @param fieldName the name of the field being validated
   * @param collection the collection to validate
   * @throws KeycloakValidationException if validation fails
   */
  public void validateNotEmpty(String fieldName, Collection<?> collection) {
    if (collection == null || collection.isEmpty()) {
      throw KeycloakValidationException.requiredField(fieldName);
    }
  }

  /**
   * Validates that a map is not null or empty.
   *
   * @param fieldName the name of the field being validated
   * @param map the map to validate
   * @throws KeycloakValidationException if validation fails
   */
  public void validateNotEmpty(String fieldName, Map<?, ?> map) {
    if (map == null || map.isEmpty()) {
      throw KeycloakValidationException.requiredField(fieldName);
    }
  }

  /**
   * Validates that a value matches a custom pattern.
   *
   * @param fieldName the name of the field being validated
   * @param value the value to validate
   * @param pattern the pattern to match against
   * @param patternDescription description of the expected format
   * @throws KeycloakValidationException if validation fails
   */
  public void validatePattern(
      String fieldName, String value, Pattern pattern, String patternDescription) {
    validateRequired(fieldName, value);

    if (!pattern.matcher(value.trim()).matches()) {
      throw KeycloakValidationException.invalidFormat(fieldName, value, patternDescription);
    }
  }

  /**
   * Validates that a numeric value is within the specified range.
   *
   * @param fieldName the name of the field being validated
   * @param value the value to validate
   * @param min minimum allowed value (inclusive)
   * @param max maximum allowed value (inclusive)
   * @throws KeycloakValidationException if validation fails
   */
  public void validateRange(String fieldName, int value, int min, int max) {
    if (value < min || value > max) {
      throw KeycloakValidationException.invalidFormat(
          fieldName, String.valueOf(value), String.format("value between %d and %d", min, max));
    }
  }

  /**
   * Validates that a URL is properly formatted.
   *
   * @param fieldName the name of the field being validated
   * @param url the URL to validate
   * @throws KeycloakValidationException if validation fails
   */
  public void validateUrl(String fieldName, String url) {
    validateRequired(fieldName, url);

    try {
      new java.net.URL(url);
    } catch (java.net.MalformedURLException e) {
      throw KeycloakValidationException.invalidFormat(fieldName, url, "valid URL format");
    }
  }

  /**
   * Validates multiple fields and collects all validation errors.
   *
   * @param validations a map of field names to validation runnables
   * @throws KeycloakValidationException if any validation fails
   */
  public void validateAll(Map<String, Runnable> validations) {
    Map<String, String> errors = new HashMap<>();

    for (Map.Entry<String, Runnable> entry : validations.entrySet()) {
      try {
        entry.getValue().run();
      } catch (KeycloakValidationException e) {
        errors.put(entry.getKey(), e.getMessage());
      }
    }

    if (!errors.isEmpty()) {
      throw KeycloakValidationException.multipleErrors(errors);
    }
  }

  /**
   * Validates a business rule condition.
   *
   * @param condition the condition to check
   * @param ruleName the name of the business rule
   * @param description description of the rule violation
   * @throws KeycloakValidationException if the condition is false
   */
  public void validateBusinessRule(boolean condition, String ruleName, String description) {
    if (!condition) {
      throw KeycloakValidationException.businessRuleViolation(ruleName, description);
    }
  }
}
