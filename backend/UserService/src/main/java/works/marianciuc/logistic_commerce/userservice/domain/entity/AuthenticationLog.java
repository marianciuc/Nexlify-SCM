package works.marianciuc.logistic_commerce.userservice.domain.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;

@Entity
@Table(name = "auth_logs")
@Data
public class AuthenticationLog {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String username;
  private String ipAddress;
  private LocalDateTime timestamp;
  private boolean successful;
  private String details;
}
