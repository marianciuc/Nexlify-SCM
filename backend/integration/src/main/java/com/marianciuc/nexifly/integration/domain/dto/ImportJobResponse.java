package com.marianciuc.nexifly.integration.domain.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@Schema(description = "Import job status response")
public class ImportJobResponse {

    @Schema(description = "Job UUID")
    private UUID id;

    @Schema(description = "Company that triggered the import")
    private UUID companyId;

    @Schema(description = "Original uploaded file name")
    private String fileName;

    @Schema(description = "Import type: CATALOG_PRICE_LIST, INVENTORY_UPDATE, SUPPLIER_PRODUCTS")
    private String importType;

    @Schema(description = "Total rows in the uploaded file")
    private Integer totalRows;

    @Schema(description = "Rows successfully imported")
    private Integer successfulRows;

    @Schema(description = "Rows that failed validation or import")
    private Integer failedRows;

    @Schema(description = "Job status: PROCESSING, COMPLETED, COMPLETED_WITH_ERRORS, FAILED")
    private String status;

    @Schema(description = "Error log JSON (per-row errors)")
    private String errorLog;

    @Schema(description = "Job creation timestamp")
    private Instant createdAt;

    @Schema(description = "Job completion timestamp (null if still processing)")
    private Instant completedAt;
}
