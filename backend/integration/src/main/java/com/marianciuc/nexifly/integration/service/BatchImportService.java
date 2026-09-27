package com.marianciuc.nexifly.integration.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marianciuc.nexifly.integration.domain.dto.ImportJobResponse;
import com.marianciuc.nexifly.integration.domain.entity.ImportJob;
import com.marianciuc.nexifly.integration.kafka.IntegrationEventProducer;
import com.marianciuc.nexifly.integration.repository.ImportJobRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Batch catalog import service.
 * Supports CSV files with required columns: sku, product_name, unit_price, unit_of_measure, stock_qty.
 * On success emits a CATALOG_IMPORT_COMPLETED Kafka event consumed by inventory-service.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BatchImportService {

    private static final String[] REQUIRED_HEADERS = {"sku", "product_name", "unit_price", "unit_of_measure", "stock_qty"};

    private final ImportJobRepository importJobRepository;
    private final IntegrationEventProducer eventProducer;
    private final ObjectMapper objectMapper;

    /**
     * Creates an import job record synchronously, then processes the file asynchronously.
     */
    @Transactional
    public ImportJobResponse initiateImport(UUID companyId, MultipartFile file, String importType) {
        ImportJob job = ImportJob.builder()
                .companyId(companyId)
                .fileName(file.getOriginalFilename())
                .importType(importType != null ? importType : "CATALOG_PRICE_LIST")
                .status("PROCESSING")
                .build();
        job = importJobRepository.save(job);

        // Fire-and-forget async processing
        processCsvAsync(job.getId(), companyId, file);

        return toResponse(job);
    }

    @Async
    @Transactional
    public void processCsvAsync(UUID jobId, UUID companyId, MultipartFile file) {
        ImportJob job = importJobRepository.findById(jobId)
                .orElseThrow(() -> new EntityNotFoundException("Import job not found: " + jobId));

        List<Map<String, String>> errorLog = new ArrayList<>();
        int total = 0;
        int successful = 0;
        int failed = 0;

        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
             CSVParser csvParser = CSVFormat.DEFAULT
                     .builder()
                     .setHeader(REQUIRED_HEADERS)
                     .setSkipHeaderRecord(true)
                     .setIgnoreHeaderCase(true)
                     .setTrim(true)
                     .build()
                     .parse(reader)) {

            for (CSVRecord record : csvParser) {
                total++;
                try {
                    validateCsvRecord(record, total);
                    // In a real implementation, here we'd save to inventory schema
                    // or publish individual row events. For the diploma demo, we count rows.
                    successful++;
                } catch (IllegalArgumentException e) {
                    failed++;
                    errorLog.add(Map.of(
                            "row", String.valueOf(total),
                            "error", e.getMessage()
                    ));
                    if (errorLog.size() > 100) {
                        // Safety limit: don't store more than 100 individual errors
                        break;
                    }
                }
            }

            job.setTotalRows(total);
            job.setSuccessfulRows(successful);
            job.setFailedRows(failed);
            job.setStatus(failed == 0 ? "COMPLETED" : "COMPLETED_WITH_ERRORS");
            job.setCompletedAt(Instant.now());
            if (!errorLog.isEmpty()) {
                job.setErrorLog(objectMapper.writeValueAsString(errorLog));
            }
            importJobRepository.save(job);

            eventProducer.publishCatalogImportCompleted(jobId, companyId, successful, failed);
            log.info("Import job {} completed: {}/{} rows ok", jobId, successful, total);

        } catch (Exception e) {
            log.error("Import job {} failed with error: {}", jobId, e.getMessage(), e);
            job.setStatus("FAILED");
            try {
                job.setErrorLog(objectMapper.writeValueAsString(java.util.List.of(
                        java.util.Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error")
                )));
            } catch (Exception ignored) {}
            job.setCompletedAt(Instant.now());
            importJobRepository.save(job);
        }
    }

    @Transactional(readOnly = true)
    public ImportJobResponse getById(UUID id) {
        return toResponse(importJobRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Import job not found: " + id)));
    }

    @Transactional(readOnly = true)
    public Page<ImportJobResponse> getByCompany(UUID companyId, Pageable pageable) {
        return importJobRepository.findByCompanyId(companyId, pageable).map(this::toResponse);
    }

    // ========================= Private helpers =========================

    private void validateCsvRecord(CSVRecord record, int rowNumber) {
        String sku = record.get("sku");
        String productName = record.get("product_name");
        String unitPrice = record.get("unit_price");

        if (sku == null || sku.isBlank()) {
            throw new IllegalArgumentException("Row " + rowNumber + ": sku is required");
        }
        if (productName == null || productName.isBlank()) {
            throw new IllegalArgumentException("Row " + rowNumber + ": product_name is required");
        }
        if (unitPrice == null || unitPrice.isBlank()) {
            throw new IllegalArgumentException("Row " + rowNumber + ": unit_price is required");
        }
        try {
            double price = Double.parseDouble(unitPrice.replace(",", "."));
            if (price < 0) throw new NumberFormatException("negative");
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Row " + rowNumber + ": unit_price must be a positive number");
        }
    }

    private ImportJobResponse toResponse(ImportJob j) {
        return ImportJobResponse.builder()
                .id(j.getId())
                .companyId(j.getCompanyId())
                .fileName(j.getFileName())
                .importType(j.getImportType())
                .totalRows(j.getTotalRows())
                .successfulRows(j.getSuccessfulRows())
                .failedRows(j.getFailedRows())
                .status(j.getStatus())
                .errorLog(j.getErrorLog())
                .createdAt(j.getCreatedAt())
                .completedAt(j.getCompletedAt())
                .build();
    }
}
