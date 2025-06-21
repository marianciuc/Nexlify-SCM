package works.marianciuc.logistic_commerce.userservice.validation;

import works.marianciuc.logistic_commerce.userservice.domain.enums.Resource;

/**
 * Functional interface for checking user access permissions to specific resources. Implementations
 * should verify if a user with the given email has permission to access the requested resource
 * based on their roles and system configuration.
 */
@FunctionalInterface
public interface AccessPermissionChecker {

  /**
   * Checks if a user is allowed to access a specific resource.
   *
   * @param email The email address of the user attempting to access the resource
   * @param resource The resource being accessed
   * @return true if the user is allowed to access the resource, false otherwise
   * @throws IllegalArgumentException if email is null or empty
   */
  boolean isUserAllowedToAccess(String email, Resource resource);
}
