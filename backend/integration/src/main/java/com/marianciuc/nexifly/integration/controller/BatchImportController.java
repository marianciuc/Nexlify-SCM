package com.marianciuc.nexifly.integration.controller;

import com.marianciuc.nexifly.integration.domain.dto.ImportJobResponse;
import com.marianciuc.nexifly.integration.service.BatchImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * Batch Catalog Import REST API.
 *
 * Endpoints:
 *  POST /api/v1/integration/imports/catalog          — upload CSV/Excel price list
 *  GET  /api/v1/integration/imports/{id}             — get job status
 *  GET  /api/v1/integration/imports/company/{companyId} — list jobs for company
 *
 * Expected CSV columns: sku, product_name, unit_price, unit_of_measure, stock_qty
 */
@RestController
@RequestMapping("/api/v1/integration/imports")
@RequiredArgsConstructor
@Tag(name = "Batch Import", description = "Bulk CSV/Excel catalog and price list import with per-row validation")
public class BatchImportController {

    private final BatchImportService batchImportService;

    @PostMapping(value = "/catalog", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(
            summary = "Upload catalog / price list CSV",
            description = """
                    Accepts a CSV file with columns: sku, product_name, unit_price, unit_of_measure, stock_qty.
                    Processing is asynchronous — use the returned job ID to poll status.
                    On completion, emits CATALOG_IMPORT_COMPLETED event to the inventory-service via Kafka.
                    """,
            responses = {
                    @ApiResponse(responseCode = "202", description = "Import job created, processing in background"),
                    @ApiResponse(responseCode = "400", description = "Invalid file or missing parameters")
            }
    )
    public ResponseEntity<ImportJobResponse> uploadCatalog(
            @Parameter(description = "Supplier company UUID")
            @RequestParam("companyId") UUID companyId,

            @Parameter(description = "Import type: CATALOG_PRICE_LIST, INVENTORY_UPDATE, SUPPLIER_PRODUCTS")
            @RequestParam(value = "importType", defaultValue = "CATALOG_PRICE_LIST") String importType,

            @Parameter(description = "CSV file (UTF-8, header row required)")
            @RequestPart("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        ImportJobResponse response = batchImportService.initiateImport(companyId, file, importType);
        return ResponseEntity.accepted().body(response);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get import job status",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Job found"),
                    @ApiResponse(responseCode = "404", description = "Job not found")
            }
    )
    public ResponseEntity<ImportJobResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(batchImportService.getById(id));
    }

    @GetMapping("/company/{companyId}")
    @Operation(summary = "List import jobs for a company")
    public ResponseEntity<Page<ImportJobResponse>> getByCompany(
            @PathVariable UUID companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(batchImportService.getByCompany(companyId, pageable));
    }
}
