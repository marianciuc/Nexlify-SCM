# TODO: Inventory Service — Production Gaps

## Текущее состояние
Наиболее зрелый из всех сервисов-каркасов: есть JPA entities, repositories, services, controllers.
Но критически не хватает: Redisson-блокировок (сейчас оптимистичная блокировка JPA),
Kafka consumer/producer, Flyway, ABC/XYZ аналитики, ROP-мониторинга.

---

## 🔴 КРИТИЧНО (Sprint 1)

### [x] 1. Flyway-миграции
**Директория:** `src/main/resources/db/migration/` (РЕАЛИЗОВАНО)
- `V1__init_inventory_schema.sql` (схема, склады, зоны хранения, категории, продукты, остатки)
- `V2__create_stock_reservations.sql` (таблица резервов)
- `V3__create_transfers.sql` (межскладские трансферы)
- `ddl-auto: validate` и схема `inventory` настроены в `application.yaml`

### [x] 2. Redisson Distributed Lock
**Файл:** `service/StockReservationService.java`, `config/RedissonConfig.java`, `service/impl/StockServiceImpl.java` (РЕАЛИЗОВАНО)
- Распределенная блокировка `RLock lock = redissonClient.getLock("lock:inventory:product:...")`
- Мягкое резервирование `softReserve` с таймаутом
- Жесткое резервирование `hardReserve`
- Откат резервов `releaseReservation` при отмене заказа
- Делегирование из `StockServiceImpl.reserveStock`

### [x] 3. Kafka Consumer — OrderCreatedEvent
**Файл:** `kafka/consumer/OrderEventConsumer.java` (РЕАЛИЗОВАНО)
- Обработка `OrderCreatedEvent` → мягкое резервирование
- Публикация `StockReservedEvent` или `StockReservationFailedEvent` в `inventory-events`
- Обработка `OrderCancelledEvent` → откат резервов

### [x] 4. Kafka Consumer — PaymentSucceededEvent (Hard Reservation)
**Файл:** `kafka/consumer/PaymentEventConsumer.java` (РЕАЛИЗОВАНО)
- `PaymentSucceededEvent` → перевод резерва в HARD
- `PaymentFailedEvent` → освобождение зарезервированного остатка

CREATE TABLE inventory.product_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES inventory.products(id),
    warehouse_id UUID NOT NULL REFERENCES inventory.warehouses(id),
    zone_id UUID REFERENCES inventory.storage_zones(id),
    batch_number VARCHAR(100) NOT NULL,
    lot_number VARCHAR(100),
    quantity_available INT NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
    quantity_reserved INT NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
    quantity_damaged INT NOT NULL DEFAULT 0 CHECK (quantity_damaged >= 0),
    purchase_price NUMERIC(12,2),
    received_date DATE NOT NULL,
    expiry_date DATE,                   -- для FEFO-picking
    fifo_seq BIGSERIAL,                 -- для FIFO-picking (автоинкремент)
    status VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, QUARANTINE, EXPIRED, WRITTEN_OFF
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, warehouse_id, batch_number)
);

-- V2__create_stock_reservations.sql
CREATE TABLE inventory.stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,              -- ID заказа из order_db (только UUID, без FK!)
    product_id UUID NOT NULL REFERENCES inventory.products(id),
    batch_id UUID REFERENCES inventory.product_batches(id),
    warehouse_id UUID NOT NULL REFERENCES inventory.warehouses(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    reservation_type VARCHAR(16) NOT NULL DEFAULT 'SOFT', -- SOFT, HARD
    expires_at TIMESTAMPTZ,             -- TTL для SOFT резерва
    released_at TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, RELEASED, CONVERTED_TO_HARD, EXPIRED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_batches_product_warehouse ON inventory.product_batches(product_id, warehouse_id);
CREATE INDEX idx_batches_expiry ON inventory.product_batches(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_batches_fifo ON inventory.product_batches(product_id, fifo_seq);
CREATE INDEX idx_reservations_order ON inventory.stock_reservations(order_id);
CREATE INDEX idx_reservations_expires ON inventory.stock_reservations(expires_at) WHERE status = 'ACTIVE';
```

### [ ] 2. Redisson Distributed Lock — ОТСУТСТВУЕТ
**Файл:** `service/impl/StockServiceImpl.java` — заменить `synchronized` / optimistic locking

Сейчас: `StockItemEn.reserve(int quantity)` в методе `StockServiceImpl` вызывается без распределённой блокировки.
В кластерном деплойменте (2+ pod) это race condition и overselling.

```java
// StockReservationService.java (новый класс)
@Service
public class StockReservationService {

    private final RedissonClient redissonClient;
    private final ProductBatchRepository batchRepository;
    private final StockReservationRepository reservationRepository;

    public ReservationResult softReserve(UUID orderId, UUID productId, int quantity) {
        // Ключ блокировки: "lock:inventory:product:{productId}"
        RLock lock = redissonClient.getLock("lock:inventory:product:" + productId);
        try {
            // Ждём получения блокировки максимум 5 сек, держим 30 сек
            if (!lock.tryLock(5, 30, TimeUnit.SECONDS)) {
                throw new StockLockTimeoutException(productId);
            }
            // FIFO/FEFO picking — выбрать партию с наименьшим fifo_seq или ближайшим expiry_date
            List<ProductBatchEn> batches = batchRepository.findAvailableBatchesFifo(productId);
            // Проверить суммарный доступный остаток
            int totalAvailable = batches.stream().mapToInt(ProductBatchEn::getQuantityAvailable).sum();
            if (totalAvailable < quantity) {
                throw new InsufficientStockException(productId, quantity, totalAvailable);
            }
            // Распределить резерв по партиям
            List<StockReservationEn> reservations = allocateAcrossBatches(orderId, batches, quantity);
            reservationRepository.saveAll(reservations);
            return ReservationResult.success(reservations);
        } finally {
            if (lock.isHeldByCurrentThread()) lock.unlock();
        }
    }

    public void hardReserve(UUID orderId) {
        // PAID: конвертировать SOFT → HARD, убрать expires_at
    }

    public void releaseReservation(UUID orderId) {
        // CANCELLED: освободить все SOFT резервы по orderId
    }
}
```
Добавить зависимость: `implementation 'org.redisson:redisson-spring-boot-starter:3.32.0'`

### [ ] 3. Kafka Consumer — OrderCreatedEvent
**Файл:** `kafka/consumer/OrderEventConsumer.java` (СОЗДАТЬ)

```java
@KafkaListener(topics = "order-events", groupId = "inventory-service")
public void handleOrderCreated(ConsumerRecord<String, OrderCreatedEvent> record) {
    OrderCreatedEvent event = record.value();
    // Проверка идемпотентности
    if (consumedEventsRepository.existsById(event.eventId())) return;

    try {
        ReservationResult result = stockReservationService.softReserve(
            event.orderId(), event.items()
        );
        // Publish StockReservedEvent через Outbox
        outboxPublisher.publish("inventory-events", new StockReservedEvent(
            event.orderId(), result.reservationId(), result.reservations()
        ));
    } catch (InsufficientStockException e) {
        // Publish StockReservationFailedEvent
        outboxPublisher.publish("inventory-events", new StockReservationFailedEvent(
            event.orderId(), e.getUnavailableSkus()
        ));
    }

    consumedEventsRepository.save(new ConsumedEventEn(event.eventId()));
}
```

### [ ] 4. Kafka Consumer — PaymentSucceededEvent (Hard Reservation)
**Файл:** `kafka/consumer/PaymentEventConsumer.java` (СОЗДАТЬ)

```java
// onPaymentSucceeded: soft_reservation → hard_reservation (снять с quantityAvailable, зафиксировать)
// onOrderCancelled: release all soft/hard reservations → вернуть quantityAvailable
```

---

## 🟠 ВАЖНО (Sprint 2)

### [ ] 5. Reorder Point (ROP) мониторинг
**Файл:** `scheduler/RopMonitoringScheduler.java` (СОЗДАТЬ)

```java
@Scheduled(cron = "0 0 6 * * *")  // каждый день в 6:00
public void checkReorderPoints() {
    // Найти все продукты где суммарный quantityAvailable <= reorder_point
    // Для каждого такого продукта:
    //   - Проверить нет ли уже открытой заявки на пополнение
    //   - Publish InventoryLowStockEvent в "inventory-events"
    //   - Notification Service отправит алерт логисту/администратору
}
```

### [ ] 6. ABC/XYZ Классификация
**Файл:** `service/AbcXyzClassificationService.java` (СОЗДАТЬ)

```
ABC по выручке:
  A — top 20% SKU = 80% выручки
  B — следующие 15% SKU = 15% выручки
  C — оставшиеся 65% SKU = 5% выручки

XYZ по коэффициенту вариации спроса CV = σ/μ:
  X — CV < 10% (стабильный спрос)
  Y — 10% <= CV < 25% (умеренная вариативность)
  Z — CV >= 25% (случайный спрос)
```

API endpoint:
```
GET /api/v1/inventory/analytics/abc-xyz?supplierId={id}&period=90d
→ List<AbcXyzItem>{sku, abcClass, xyzClass, avgDemand, cv, annualRevenue}
```

### [ ] 7. Межскладские трансферы
**Файл:** `controller/TransferController.java` (СОЗДАТЬ)

```
POST /api/v1/inventory/transfers
  body: {fromWarehouseId, toWarehouseId, items: [{productId, batchId, quantity}], requestedDate}

GET  /api/v1/inventory/transfers/{id}
GET  /api/v1/inventory/transfers?status=PENDING&warehouseId=...
PATCH /api/v1/inventory/transfers/{id}/confirm  → статус IN_TRANSIT
PATCH /api/v1/inventory/transfers/{id}/complete → статус COMPLETED, обновить quantityAvailable
```

Сущность `inventory.stock_transfers` (Flyway V3).

### [ ] 8. Инвентаризация (Stock Count)
**Файл:** `controller/StockCountController.java` (СОЗДАТЬ)

```
POST /api/v1/inventory/counts        → создать задание инвентаризации
POST /api/v1/inventory/counts/{id}/items → внести фактический пересчёт партии
POST /api/v1/inventory/counts/{id}/reconcile → сверить факт с остатками, создать акты расхождений
```

### [ ] 9. GraphHopper Distance Matrix — подготовить DTO
**Файл:** `service/WarehouseDistanceService.java` (СОЗДАТЬ)

Logistics Service при VRP-оптимизации запросит `GET /api/v1/inventory/warehouses/coordinates` —
вернуть список всех активных складов с lat/lon для матрицы расстояний.

---

## 📁 Файлы для создания
```
backend/inventory/src/main/java/.../inventory/
├── config/
│   ├── RedissonConfig.java
│   ├── KafkaConfig.java
│   └── KafkaTopicConfig.java
├── domain/entity/
│   ├── StorageZoneEn.java          ← СОЗДАТЬ
│   ├── ProductBatchEn.java         ← СОЗДАТЬ (заменить StockItemEn)
│   └── StockReservationEn.java     ← СОЗДАТЬ
├── kafka/
│   ├── consumer/OrderEventConsumer.java
│   ├── consumer/PaymentEventConsumer.java
│   ├── OutboxEventPublisher.java
│   └── events/{StockReservedEvent, StockReservationFailedEvent, ...}.java
├── service/
│   ├── StockReservationService.java  ← СОЗДАТЬ (с Redisson)
│   ├── AbcXyzClassificationService.java ← СОЗДАТЬ
│   └── WarehouseDistanceService.java  ← СОЗДАТЬ
├── scheduler/
│   └── RopMonitoringScheduler.java   ← СОЗДАТЬ
└── controller/
    ├── TransferController.java        ← СОЗДАТЬ
    └── StockCountController.java      ← СОЗДАТЬ
```
