package works.marianciuc.logistic_commerce.userservice.domain.enums;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.Getter;

/** Enumeration representing various roles. */
@Schema(description = "Company role", example = "LOGISTICIAN")
@Getter
public enum Role {

  /** Enum constant representing the role of a logistician within the system. */
  @Schema(description = "Logistic specialist responsible for supply chain management")
  LOGISTICIAN(
      Set.of(
          // MOD_001
          SecurityScope.MOD_001_003,

          // MOD_002
          SecurityScope.MOD_002_003,

          // MOD_003
          SecurityScope.MOD_003_003,
          SecurityScope.MOD_003_004,
          SecurityScope.MOD_003_007,
          SecurityScope.MOD_003_002,

          // MOD_004
          SecurityScope.MOD_004_001,
          SecurityScope.MOD_004_004)),

  @Schema(description = "Manager responsible for his company")
  MANAGER(
      Set.of(
          // MOD_001
          SecurityScope.MOD_001_004,
          SecurityScope.MOD_001_104,
          SecurityScope.MOD_001_005,
          SecurityScope.MOD_001_007,

          // MOD_002
          SecurityScope.MOD_002_002,
          SecurityScope.MOD_002_003,
          SecurityScope.MOD_002_005,

          // MOD_003
          SecurityScope.MOD_003_001,
          SecurityScope.MOD_003_002,
          SecurityScope.MOD_003_004,
          SecurityScope.MOD_003_005,
          SecurityScope.MOD_003_006,
          SecurityScope.MOD_003_008,
          SecurityScope.MOD_003_009,
          SecurityScope.MOD_003_010,

          // MOD_004
          SecurityScope.MOD_004_001,
          SecurityScope.MOD_004_002,
          SecurityScope.MOD_004_003,
          SecurityScope.MOD_004_004,
          SecurityScope.MOD_004_005,
          SecurityScope.MOD_004_006,
          SecurityScope.MOD_004_007,
          SecurityScope.MOD_004_009,
          SecurityScope.MOD_004_010,
          SecurityScope.MOD_004_011)),

  @Schema(description = "Driver responsible for transportation and delivery")
  DRIVER(Set.of(SecurityScope.MOD_001_003, SecurityScope.MOD_003_004, SecurityScope.MOD_004_001)),

  @Schema(description = "Warehouse manager responsible for inventory and storage operations")
  WAREHOUSE_MANAGER(
      Set.of(
          // MOD_001
          SecurityScope.MOD_001_004,

          // MOD_003
          SecurityScope.MOD_003_004,

          // MOD_004
          SecurityScope.MOD_004_001,
          SecurityScope.MOD_004_002,
          SecurityScope.MOD_004_003,
          SecurityScope.MOD_004_004,
          SecurityScope.MOD_004_007,
          SecurityScope.MOD_004_009)),

  /**
   * Represents the "System Administrator" role in the system.
   *
   * <p>This role has access to all defined security possibilities within the system, granting the
   * ability to perform any system-level actions or operations. Typically assigned to users who
   * require unrestricted technical or administrative control over all system functionalities.
   */
  @Schema(description = "System administrator with technical system access (Has all possibilities)")
  SYSTEM_ADMINISTRATOR(Arrays.stream(SecurityScope.values()).collect(Collectors.toSet())),

  @Schema(description = "Moderator responsible for content and user management")
  MODERATOR(
      Set.of(
          // MOD_001
          SecurityScope.MOD_001_002,
          SecurityScope.MOD_001_003,
          SecurityScope.MOD_001_004,
          SecurityScope.MOD_001_104,
          SecurityScope.MOD_001_006,
          SecurityScope.MOD_001_007,

          // MOD_002
          SecurityScope.MOD_002_002,
          SecurityScope.MOD_002_003,
          SecurityScope.MOD_002_004,

          // MOD_003
          SecurityScope.MOD_003_002,
          SecurityScope.MOD_003_003,
          SecurityScope.MOD_003_004,
          SecurityScope.MOD_003_005,

          // MOD_004
          SecurityScope.MOD_004_001,
          SecurityScope.MOD_004_002,
          SecurityScope.MOD_004_003,
          SecurityScope.MOD_004_004,
          SecurityScope.MOD_004_007,
          SecurityScope.MOD_004_008)),

  @Schema(description = "Order manager responsible for order processing and fulfillment")
  ORDER_MANAGER(
      Set.of( // MOD_001
          SecurityScope.MOD_001_004,
          SecurityScope.MOD_001_104,

          // MOD_002
          SecurityScope.MOD_002_003,

          // MOD_003
          SecurityScope.MOD_003_001,
          SecurityScope.MOD_003_002,
          SecurityScope.MOD_003_004,
          SecurityScope.MOD_003_005,
          SecurityScope.MOD_003_006,
          SecurityScope.MOD_003_008,
          SecurityScope.MOD_003_009,
          SecurityScope.MOD_003_010,

          // MOD_004
          SecurityScope.MOD_004_001,
          SecurityScope.MOD_004_002,
          SecurityScope.MOD_004_003,
          SecurityScope.MOD_004_004,
          SecurityScope.MOD_004_005,
          SecurityScope.MOD_004_006,
          SecurityScope.MOD_004_007,
          SecurityScope.MOD_004_009,
          SecurityScope.MOD_004_010)),

  @Schema(description = "Manager without company approved status")
  MANAGER_NOT_VERIFIED(
      Set.of(SecurityScope.MOD_001_004, SecurityScope.MOD_002_001, SecurityScope.MOD_002_005)),
  ;

  private final Set<SecurityScope> securityPossibilities;

  Role(Set<SecurityScope> securityPossibilities) {
    this.securityPossibilities = securityPossibilities;
  }

  /**
   * Retrieves all {@code Role} instances that are associated with the specified {@code
   * SecurityPossibility}.
   *
   * <p>This method iterates over all available roles and checks if the provided {@code
   * SecurityPossibility} exists within their associated set of security possibilities. The roles
   * that match the condition are then collected into a set and returned.
   *
   * @param securityScope the {@code SecurityPossibility} to check against each role's security
   *     possibilities
   * @return a set of {@code Role} instances that contain the specified {@code SecurityPossibility}
   */
  public static Set<Role> getRoleThatContainsPossibility(SecurityScope securityScope) {
    return Arrays.stream(Role.values())
        .filter(role -> role.getSecurityPossibilities().contains(securityScope))
        .collect(Collectors.toSet());
  }

  /**
   * Retrieves all roles that are associated with the specified set of security possibilities.
   *
   * <p>This method iterates through the provided set of {@code SecurityPossibility} objects and
   * determines which roles contain each of the possibilities. It then aggregates all the roles into
   * a single set to be returned.
   *
   * @param securityPossibilities the set of {@code SecurityPossibility} objects whose associated
   *     roles are to be retrieved
   * @return a set of {@code Role} objects that contain any of the specified security possibilities
   */
  public static Set<Role> getRoleThatContainsPossibilities(
      Set<SecurityScope> securityPossibilities) {
    return securityPossibilities.stream()
        .map(Role::getRoleThatContainsPossibility)
        .flatMap(Set::stream)
        .collect(Collectors.toSet());
  }
}
