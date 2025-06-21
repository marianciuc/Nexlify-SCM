package works.marianciuc.logistic_commerce.userservice.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Entity representing authentication attempt logs for audit and security purposes. Tracks
 * successful and failed authentication attempts with relevant metadata.
 */
@Entity
@Table(
    name = "auth_logs",
    indexes = {
      @Index(name = "idx_auth_logs_username", columnList = "username"),
      @Index(name = "idx_auth_logs_timestamp", columnList = "timestamp"),
      @Index(name = "idx_auth_logs_ip_address", columnList = "ip_address"),
      @Index(name = "idx_auth_logs_successful", columnList = "successful")
    })
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@ToString
public class AuthenticationLog extends BaseEntity {

  @NotBlank(message = "Username cannot be blank")
  @Size(max = 255, message = "Username cannot exceed 255 characters")
  @Column(name = "username", nullable = false)
  private String username;

  @NotBlank(message = "IP address cannot be blank")
  @Size(max = 45, message = "IP address cannot exceed 45 characters") // IPv6 max length
  @Column(name = "ip_address", nullable = false, length = 45)
  private String ipAddress;

  @NotNull(message = "Timestamp cannot be null")
  @Builder.Default
  @Column(name = "timestamp", nullable = false)
  private LocalDateTime timestamp = LocalDateTime.now();

  @Builder.Default
  @Column(name = "successful", nullable = false)
  private boolean successful = false;

  @Size(max = 1000, message = "Details cannot exceed 1000 characters")
  @Column(name = "details", length = 1000)
  private String details;

  @Size(max = 255, message = "User agent cannot exceed 255 characters")
  @Column(name = "user_agent")
  private String userAgent;

  @Size(max = 100, message = "Session ID cannot exceed 100 characters")
  @Column(name = "session_id", length = 100)
  private String sessionId;

  @Column(name = "failure_reason")
  private String failureReason;

  /** Creates a successful authentication log entry. */
  public static AuthenticationLog createSuccessfulLogin(
      String username, String ipAddress, String userAgent, String sessionId) {
    return AuthenticationLog.builder()
        .username(username)
        .ipAddress(ipAddress)
        .userAgent(userAgent)
        .sessionId(sessionId)
        .successful(true)
        .details("Successful authentication")
        .build();
  }

  /** Creates a failed authentication log entry. */
  public static AuthenticationLog createFailedLogin(
      String username, String ipAddress, String userAgent, String failureReason) {
    return AuthenticationLog.builder()
        .username(username)
        .ipAddress(ipAddress)
        .userAgent(userAgent)
        .successful(false)
        .failureReason(failureReason)
        .details("Failed authentication: " + failureReason)
        .build();
  }

  /** Checks if this authentication attempt failed. */
  public boolean isFailed() {
    return !successful;
  }
}
