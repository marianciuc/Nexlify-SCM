package works.marianciuc.logistic_commerce.userservice.domain.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Where;
import org.springframework.data.annotation.LastModifiedDate;
import works.marianciuc.logistic_commerce.userservice.exceptions.records.DeletedRecordException;

@SuperBuilder
@Data
@MappedSuperclass
@AllArgsConstructor
@NoArgsConstructor
@Where(clause = "is_deleted = false")
public abstract class BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @LastModifiedDate
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  @Builder.Default
  @Column(name = "is_deleted", nullable = false)
  private boolean isDeleted = false;

  @PreUpdate
  public void preUpdate() {
    this.updatedAt = LocalDateTime.now();
    verifyRecord();
  }

  @PrePersist
  public void prePersist() {
    verifyRecord();
  }

  @Override
  public boolean equals(Object o) {
    if (o instanceof BaseEntity baseEntity) {
      return Objects.equals(this.id, baseEntity.id);
    }
    return false;
  }

  public void restore() {
    this.isDeleted = false;
    this.deletedAt = null;
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }

  public void delete() {
    this.isDeleted = true;
  }

  @Override
  public String toString() {
    return String.format(
        "BaseEntity{id=%s, createdAt=%s, updatedAt=%s, isDeleted=%s}",
        id, createdAt, updatedAt, isDeleted);
  }

  public void verifyRecord() throws DeletedRecordException {
    if (this.isDeleted)
      throw new DeletedRecordException(this.getClass().getName() + ":: Record is deleted");
  }
}
