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

/**
 * Base entity class providing common fields and functionality for all entities. Implements soft
 * delete pattern with auditing capabilities.
 */
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
    this.deletedAt = LocalDateTime.now();
  }

  @Override
  public String toString() {
    return String.format(
        "BaseEntity{id=%s, createdAt=%s, updatedAt=%s, isDeleted=%s}",
        id, createdAt, updatedAt, isDeleted);
  }

  /**
   * Verifies whether the current record has been marked as deleted.
   *
   * <p>This method checks the `isDeleted` field of the current entity. If the record is marked as
   * deleted, it throws a `DeletedRecordException` with a descriptive message containing the
   * record's type and ID (or "unknown" if the ID is null).
   *
   * <p>This method enforces the integrity of operations on entities by ensuring that deleted
   * records cannot be inadvertently accessed or modified.
   *
   * @throws DeletedRecordException if the current record is marked as deleted
   */
  public void verifyRecord() throws DeletedRecordException {
    if (this.isDeleted) {
      throw new DeletedRecordException(
          String.format(
              "%s: Record with ID %s is deleted",
              this.getClass().getSimpleName(), this.id != null ? this.id : "unknown"));
    }
  }
}
