package com.marianciuc.nexifly.rfq.controller;

import com.marianciuc.nexifly.rfq.domain.dto.*;
import com.marianciuc.nexifly.rfq.service.RfqLifecycleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/rfq")
@RequiredArgsConstructor
public class RfqController {

    private final RfqLifecycleService rfqService;

    // Buyer endpoints

    @PostMapping
    public ResponseEntity<RfqResponse> createRfq(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantIdHeader,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestBody CreateRfqRequest request
    ) {
        UUID tenantId = tenantIdHeader != null && !tenantIdHeader.isBlank()
                ? UUID.fromString(tenantIdHeader) : UUID.fromString("00000000-0000-0000-0000-000000000001");
        return ResponseEntity.ok(rfqService.createRfq(tenantId, tenantId, request));
    }

    @GetMapping
    public ResponseEntity<Page<RfqResponse>> getBuyerRfqs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantIdHeader,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        UUID tenantId = tenantIdHeader != null && !tenantIdHeader.isBlank()
                ? UUID.fromString(tenantIdHeader) : UUID.fromString("00000000-0000-0000-0000-000000000001");
        return ResponseEntity.ok(rfqService.getBuyerRfqs(tenantId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RfqResponse> getRfqById(@PathVariable UUID id) {
        return ResponseEntity.ok(rfqService.getRfqById(id, true));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<RfqResponse> publishRfq(@PathVariable UUID id) {
        return ResponseEntity.ok(rfqService.publishRfq(id));
    }

    @PostMapping("/{id}/award/{bidId}")
    public ResponseEntity<RfqResponse> awardBid(@PathVariable UUID id, @PathVariable UUID bidId) {
        return ResponseEntity.ok(rfqService.awardBid(id, bidId));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<RfqResponse> cancelRfq(@PathVariable UUID id) {
        return ResponseEntity.ok(rfqService.cancelRfq(id));
    }

    @GetMapping("/{id}/bids")
    public ResponseEntity<List<BidResponse>> getRfqBids(@PathVariable UUID id) {
        RfqResponse rfq = rfqService.getRfqById(id, true);
        return ResponseEntity.ok(rfq.bids());
    }

    // Supplier endpoints

    @GetMapping("/board")
    public ResponseEntity<Page<RfqResponse>> getPublicBoard(
            @RequestParam(required = false) String category,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(rfqService.getPublicBoard(category, pageable));
    }

    @GetMapping("/{id}/public")
    public ResponseEntity<RfqResponse> getPublicRfqDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(rfqService.getRfqById(id, false));
    }

    @PostMapping("/{id}/bids")
    public ResponseEntity<BidResponse> submitBid(
            @PathVariable UUID id,
            @RequestBody SubmitBidRequest request
    ) {
        return ResponseEntity.ok(rfqService.submitBid(id, request));
    }

    @GetMapping("/my-bids")
    public ResponseEntity<Page<BidResponse>> getMyBids(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantIdHeader,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        UUID tenantId = tenantIdHeader != null && !tenantIdHeader.isBlank()
                ? UUID.fromString(tenantIdHeader) : UUID.fromString("00000000-0000-0000-0000-000000000001");
        return ResponseEntity.ok(rfqService.getSupplierBids(tenantId, pageable));
    }

    // Analytics

    @GetMapping("/stats")
    public ResponseEntity<RfqStatsResponse> getStats(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantIdHeader
    ) {
        UUID tenantId = tenantIdHeader != null && !tenantIdHeader.isBlank()
                ? UUID.fromString(tenantIdHeader) : null;
        return ResponseEntity.ok(rfqService.getStats(tenantId));
    }
}
