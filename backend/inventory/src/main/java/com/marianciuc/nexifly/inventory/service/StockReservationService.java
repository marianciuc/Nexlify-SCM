package com.marianciuc.nexifly.inventory.service;

import com.marianciuc.nexifly.inventory.domain.dto.response.StockItemResponse;
import com.marianciuc.nexifly.inventory.exception.InsufficientStockException;
import com.marianciuc.nexifly.inventory.exception.ResourceNotFoundException;
import com.marianciuc.nexifly.inventory.repository.ProductRepository;
import com.marianciuc.nexifly.inventory.repository.StockItemRepository;
import com.marianciuc.nexifly.inventory.repository.StockReservationRepository;
import com.marianciuc.nexifly.inventory.repository.entity.ProductEn;
import com.marianciuc.nexifly.inventory.repository.entity.StockItemEn;
import com.marianciuc.nexifly.inventory.repository.entity.StockReservationEn;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
@RequiredArgsConstructor
public class StockReservationService {

    private final RedissonClient redissonClient;
    private final StockItemRepository stockItemRepository;
    private final StockReservationRepository reservationRepository;
    private final ProductRepository productRepository;

    @Data
    @Builder
    public static class ReservationResult {
        private boolean success;
        private UUID reservationId;
        private UUID orderId;
        private UUID productId;
        private String sku;
        private int quantity;
        private UUID warehouseId;
        private String message;
    }

    @Transactional
    public ReservationResult softReserve(UUID orderId, UUID productId, String sku, int quantity, UUID warehouseId) {
        String lockKey = "lock:inventory:product:" + (productId != null ? productId : sku);
        RLock lock = redissonClient.getLock(lockKey);

        try {
            boolean acquired = lock.tryLock(5, 30, TimeUnit.SECONDS);
            if (!acquired) {
                log.warn("Failed to acquire distributed lock for inventory: {}", lockKey);
                throw new RuntimeException("Could not acquire lock for inventory reservation: " + lockKey);
            }

            List<StockItemEn> items;
            if (sku != null && !sku.isBlank()) {
                items = stockItemRepository.findByProductSku(sku);
            } else if (productId != null) {
                items = stockItemRepository.findByProductId(productId);
            } else {
                throw new IllegalArgumentException("Either productId or sku must be provided");
            }

            if (items.isEmpty()) {
                throw new ResourceNotFoundException("No stock items found for SKU/Product: " + (sku != null ? sku : productId));
            }

            StockItemEn item;
            if (warehouseId != null) {
                item = items.stream()
                        .filter(s -> warehouseId.equals(s.getWarehouse().getId()))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("No stock found in warehouse: " + warehouseId));
            } else {
                item = items.stream()
                        .max(java.util.Comparator.comparingInt(StockItemEn::getQuantityAvailable))
                        .orElseThrow(() -> new ResourceNotFoundException("No stock found"));
            }

            if (item.getQuantityAvailable() < quantity) {
                throw new InsufficientStockException("Insufficient stock: available " + item.getQuantityAvailable() + ", requested " + quantity);
            }

            item.reserve(quantity);
            stockItemRepository.save(item);

            StockReservationEn reservation = StockReservationEn.builder()
                    .orderId(orderId)
                    .product(item.getProduct())
                    .warehouse(item.getWarehouse())
                    .quantity(quantity)
                    .reservationType("SOFT")
                    .status("ACTIVE")
                    .expiresAt(Instant.now().plus(30, ChronoUnit.MINUTES))
                    .build();

            StockReservationEn savedReservation = reservationRepository.save(reservation);

            log.info("Soft-reserved {} units of product {} for order {} (resId: {})",
                    quantity, item.getProduct().getSku(), orderId, savedReservation.getId());

            return ReservationResult.builder()
                    .success(true)
                    .reservationId(savedReservation.getId())
                    .orderId(orderId)
                    .productId(item.getProduct().getId())
                    .sku(item.getProduct().getSku())
                    .quantity(quantity)
                    .warehouseId(item.getWarehouse().getId())
                    .message("Soft reservation confirmed")
                    .build();

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Thread interrupted while acquiring lock", e);
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    @Transactional
    public void hardReserve(UUID orderId) {
        List<StockReservationEn> reservations = reservationRepository.findByOrderIdAndStatus(orderId, "ACTIVE");
        for (StockReservationEn res : reservations) {
            res.setReservationType("HARD");
            res.setStatus("CONVERTED_TO_HARD");
            res.setExpiresAt(null);
            reservationRepository.save(res);
            log.info("Converted soft reservation {} to HARD for order {}", res.getId(), orderId);
        }
    }

    @Transactional
    public void releaseReservation(UUID orderId) {
        List<StockReservationEn> reservations = reservationRepository.findByOrderId(orderId);
        for (StockReservationEn res : reservations) {
            if ("ACTIVE".equalsIgnoreCase(res.getStatus()) || "CONVERTED_TO_HARD".equalsIgnoreCase(res.getStatus())) {
                String lockKey = "lock:inventory:product:" + res.getProduct().getId();
                RLock lock = redissonClient.getLock(lockKey);
                try {
                    lock.lock(10, TimeUnit.SECONDS);
                    List<StockItemEn> items = stockItemRepository.findByProductSku(res.getProduct().getSku());
                    if (!items.isEmpty()) {
                        StockItemEn item = items.getFirst();
                        item.release(res.getQuantity());
                        stockItemRepository.save(item);
                    }
                    res.setStatus("RELEASED");
                    res.setReleasedAt(Instant.now());
                    reservationRepository.save(res);
                    log.info("Released reservation {} ({} units) for order {}", res.getId(), res.getQuantity(), orderId);
                } finally {
                    if (lock.isHeldByCurrentThread()) {
                        lock.unlock();
                    }
                }
            }
        }
    }
}
