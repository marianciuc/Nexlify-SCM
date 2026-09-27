package com.marianciuc.nexifly.integration.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

/**
 * Import Job — задание пакетной загрузки прайс-листа/каталога.
 * import_type: CATALOG_PRICE_LIST, INVENTORY_UPDATE, SUPPLIER_PRODUCTS
 * status: PROCESSING, COMPLETED, COMPLETED_WITH_ERRORS, FAILED
 */
@Entity
@Table(name = "import_jobs", schema = "integration")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportJob {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "import_type", nullable = false, length = 32)
    @Builder.Default
    private String importType = "CATALOG_PRICE_LIST";

    @Column(name = "total_rows", nullable = false)
    @Builder.Default
    private Integer totalRows = 0;

    @Column(name = "successful_rows", nullable = false)
    @Builder.Default
    private Integer successfulRows = 0;

    @Column(name = "failed_rows", nullable = false)
    @Builder.Default
    private Integer failedRows = 0;

    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private String status = "PROCESSING";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "error_log", columnDefinition = "jsonb")
    private String errorLog;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        if (this.status == null) this.status = "PROCESSING";
        if (this.importType == null) this.importType = "CATALOG_PRICE_LIST";
    }
}
