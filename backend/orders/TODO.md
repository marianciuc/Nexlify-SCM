# TODO: Order Service — Full Implementation Required

## Текущее состояние
Каркас сервиса с `OrderController` на in-memory `HashMap`. Никакой персистентности, Kafka, FSM, Saga.
Это **mock** — нужна полная реализация.

---

## 🔴 КРИТИЧНО — ФУНДАМЕНТ (Sprint 1)

### [x] 1. Gradle-зависимости — добавить всё необходимое
**Файл:** `build.gradle` (РЕАЛИЗОВАНО)
- JPA, Validation, Flyway, Redisson, Kafka, Postgresql

### [x] 2. application.yaml — настроить
**Файл:** `src/main/resources/application.yaml` (РЕАЛИЗОВАНО)
- Datasource, Flyway `orders` schema, JPA `ddl-auto: validate`, Kafka serializers/deserializers

### [x] 3. Flyway — DDL схема `orders`
**Директория:** `src/main/resources/db/migration/` (РЕАЛИЗОВАНО)
- `V1__create_orders_schema.sql`
- `V2__create_order_items.sql`
- `V3__create_order_status_history.sql`
- `V4__create_price_agreements.sql`
- `V5__create_outbox_events.sql`
- `V6__create_idempotent_consumer.sql`

### [x] 4. Order FSM (Finite State Machine)
**Файл:** `domain/enums/OrderStatus.java`, `domain/fsm/OrderFsm.java` (РЕАЛИЗОВАНО)
- Полная матрица допустимых переходов и валидация

### [x] 5. Order Saga Orchestrator
**Файл:** `saga/OrderSagaOrchestrator.java` (РЕАЛИЗОВАНО)
- Оркестрация через Outbox: `OrderCreatedEvent`, `OrderStatusChangedEvent`, `OrderCancelledEvent`, `OrderPaidEvent`

### [x] 6. Transactional Outbox Publisher
**Файл:** `kafka/OutboxEventPublisher.java` (РЕАЛИЗОВАНО)
- `enqueue()` в транзакции + `@Scheduled(fixedDelay = 3000)` фоновый поллер

### [x] 7. Kafka Consumer для Saga ответов
**Файлы:** `kafka/consumer/InventoryEventConsumer.java`, `PaymentEventConsumer.java`, `LogisticsEventConsumer.java` (РЕАЛИЗОВАНО)
- Проверка идемпотентности через таблицу `orders.consumed_events`
- Обработка soft reserve success/fail, payment success/fail, shipment dispatched/delivered

```sql
-- V1__create_orders_schema.sql
CREATE SCHEMA IF NOT EXISTS orders;

CREATE TABLE orders.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(64) UNIQUE NOT NULL,   -- ORD-2026-XXXXX
    tenant_id UUID NOT NULL,                    -- из X-Tenant-Id
    customer_id UUID NOT NULL,                  -- ID компании-покупателя
    supplier_id UUID,                           -- ID компании-поставщика (может быть выбран позже)
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT', -- FSM state
    currency VARCHAR(3) NOT NULL DEFAULT 'PLN',
    subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
    vat_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    delivery_address TEXT,
    delivery_city VARCHAR(128),
    delivery_postal_code VARCHAR(16),
    requested_delivery_date DATE,
    sla_deadline TIMESTAMPTZ,                   -- когда заказ должен быть доставлен по SLA
    sla_penalty_per_day NUMERIC(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- V2__create_order_items.sql
CREATE TABLE orders.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders.orders(id) ON DELETE CASCADE,
    sku VARCHAR(128) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL,
    discount_percent NUMERIC(5,2) DEFAULT 0,
    vat_rate NUMERIC(5,2) NOT NULL DEFAULT 23,  -- польский НДС 23%
    line_total NUMERIC(15,2) NOT NULL,
    warehouse_id UUID,                           -- откуда резервировать
    batch_number VARCHAR(100)
);

-- V3__create_order_status_history.sql
CREATE TABLE orders.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders.orders(id) ON DELETE CASCADE,
    old_status VARCHAR(32),
    new_status VARCHAR(32) NOT NULL,
    changed_by UUID,                            -- userId
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- V4__create_price_agreements.sql
-- Рамочные ценовые договоры между покупателем и поставщиком
CREATE TABLE orders.price_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_company_id UUID NOT NULL,
    supplier_company_id UUID NOT NULL,
    sku VARCHAR(128) NOT NULL,
    agreed_price NUMERIC(12,2) NOT NULL,
    discount_percent NUMERIC(5,2) DEFAULT 0,
    payment_terms VARCHAR(32) DEFAULT 'NET_30',  -- NET_30, NET_60, PREPAY, COD
    valid_from DATE NOT NULL,
    valid_to DATE,
    min_order_quantity INT DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (buyer_company_id, supplier_company_id, sku)
);

-- V5__create_outbox_events.sql
CREATE TABLE orders.outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(64) NOT NULL,        -- "Order"
    aggregate_id UUID NOT NULL,
    event_type VARCHAR(128) NOT NULL,            -- "OrderCreatedEvent"
    payload JSONB NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING', -- PENDING, SENT, FAILED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

-- V6__create_idempotent_consumer.sql
CREATE TABLE orders.consumed_events (
    event_id VARCHAR(255) PRIMARY KEY,
    consumed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_tenant ON orders.orders(tenant_id);
CREATE INDEX idx_orders_customer ON orders.orders(customer_id);
CREATE INDEX idx_orders_status ON orders.orders(status);
CREATE INDEX idx_outbox_pending ON orders.outbox_events(status) WHERE status = 'PENDING';
```

---

## 🔴 КРИТИЧНО — ДОМЕННАЯ ЛОГИКА (Sprint 1)

### [ ] 4. Order FSM (Finite State Machine)
**Файл:** `domain/enums/OrderStatus.java` + `domain/fsm/OrderFsm.java` (СОЗДАТЬ)

```
Валидные переходы:
DRAFT → SUBMITTED (покупатель подтверждает корзину)
SUBMITTED → RESERVED (inventory подтвердил резерв)
SUBMITTED → CANCELLED_OUT_OF_STOCK (inventory отказал в резерве)
RESERVED → AWAITING_PAYMENT (billing создал инвойс)
AWAITING_PAYMENT → PAID (Stripe webhook / подтверждение Net-30)
AWAITING_PAYMENT → PAYMENT_FAILED (Stripe отклонил)
PAID → IN_PROCESSING (склад начал комплектацию)
IN_PROCESSING → SHIPPED (логистика забрала)
SHIPPED → DELIVERED (получатель подписал ТТН)
DELIVERED → COMPLETED (после SLA-периода рекламации)
* → CANCELLED (только из DRAFT, SUBMITTED, AWAITING_PAYMENT)
* → DISPUTED (покупатель открыл рекламацию из DELIVERED)
```

```java
// OrderFsm.java:
public class OrderFsm {
    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = Map.of(
        DRAFT, Set.of(SUBMITTED, CANCELLED),
        SUBMITTED, Set.of(RESERVED, CANCELLED_OUT_OF_STOCK, CANCELLED),
        ...
    );
    
    public static void validate(OrderStatus from, OrderStatus to) {
        if (!ALLOWED_TRANSITIONS.getOrDefault(from, Set.of()).contains(to)) {
            throw new InvalidOrderStatusTransitionException(from, to);
        }
    }
}
```

### [ ] 5. Order Saga Orchestrator
**Файл:** `saga/OrderSagaOrchestrator.java` (СОЗДАТЬ)

Order Service является **оркестратором Saga** — управляет потоком через события:
```
1. createOrder() → publish OrderCreatedEvent → ждёт StockReservedEvent / StockReservationFailedEvent
2. onStockReserved() → перевести в RESERVED → publish OrderPaymentRequiredEvent
3. onStockReservationFailed() → перевести в CANCELLED_OUT_OF_STOCK → publish OrderCancelledEvent (компенсация)
4. onPaymentSucceeded() → перевести в PAID → publish OrderPaidEvent (inventory hard-lock + logistics dispatch)
5. onPaymentFailed() → перевести в PAYMENT_FAILED → publish StockReleaseCommand (компенсация)
6. onRouteDispatched() → перевести в SHIPPED
7. onDeliveryConfirmed() → перевести в DELIVERED
```

### [ ] 6. Transactional Outbox Publisher
**Файл:** `kafka/OutboxEventPublisher.java` (СОЗДАТЬ)

```java
// Scheduler каждые 5 секунд:
// 1. SELECT * FROM outbox_events WHERE status = 'PENDING' ORDER BY created_at LIMIT 100
// 2. Для каждого события: kafkaTemplate.send(topic, payload)
// 3. UPDATE outbox_events SET status = 'SENT', sent_at = NOW() WHERE id = ?
// 4. При ошибке: status = 'FAILED', retry_count++
// При retry_count > 3 — публиковать в DLT (Dead Letter Topic)

@Scheduled(fixedDelay = 5000)
public void publishPendingEvents() { ... }
```

### [ ] 7. Kafka Consumer для Saga ответов
**Файл:** `kafka/consumer/InventoryEventConsumer.java` (СОЗДАТЬ)
**Файл:** `kafka/consumer/PaymentEventConsumer.java` (СОЗДАТЬ)
**Файл:** `kafka/consumer/LogisticsEventConsumer.java` (СОЗДАТЬ)

Каждый консьюмер:
1. Проверяет идемпотентность: `SELECT COUNT(*) FROM consumed_events WHERE event_id = ?`
2. Если уже обработано — skip (идемпотентный consumer)
3. Иначе — вызвать Saga Orchestrator, сохранить в `consumed_events`

---

## 🟠 ВАЖНО — БИЗНЕС-ЛОГИКА (Sprint 2)

### [x] 8. SLA Calculator
**Файл:** `service/SlaCalculationService.java` (РЕАЛИЗОВАНО)
- Расчет рабочего дедлайна по SLA с исключением выходных дней

### [x] 9. Price Agreement Lookup
**Файл:** `service/PriceAgreementService.java` (РЕАЛИЗОВАНО)
- Поиск контрактной цены и скидки по buyerId, supplierId, sku

### [ ] 10. Order Cancel с компенсирующими транзакциями
**Файл:** `service/OrderCancellationService.java`

### [ ] 11. Bulk Order Import (B2B EDI)
**Файл:** `controller/BulkOrderController.java`

### [x] 12. REST API — дополнить недостающие endpoints
**Файл:** `controller/OrderController.java`, `service/impl/OrderServiceImpl.java` (РЕАЛИЗОВАНО)
- `GET /api/v1/orders` (Pageable, фильтры)
- `GET /api/v1/orders/{id}`
- `POST /api/v1/orders` (create DRAFT)
- `POST /api/v1/orders/{id}/submit` (starts Saga)
- `PATCH /api/v1/orders/{id}/cancel`
- `GET /api/v1/orders/stats` (агрегированная аналитика)

```
GET    /api/v1/orders               → Page<OrderSummaryResponse> (фильтры: status, customerId, dateFrom, dateTo)
GET    /api/v1/orders/{id}          → OrderDetailResponse (с items, statusHistory, shipments)
POST   /api/v1/orders               → создать черновик (DRAFT)
POST   /api/v1/orders/{id}/submit   → DRAFT → SUBMITTED (запускает Saga)
PATCH  /api/v1/orders/{id}/cancel   → отмена с причиной
GET    /api/v1/orders/{id}/timeline → история статусов + Kafka-события
GET    /api/v1/orders/stats         → агрегация: count by status, total revenue, OTIF%
GET    /api/v1/orders/{id}/items    → позиции заказа
POST   /api/v1/orders/{id}/items    → добавить позицию (только DRAFT)
DELETE /api/v1/orders/{id}/items/{itemId} → удалить позицию (только DRAFT)
```

---

## 📁 Итоговая структура файлов для создания
```
backend/orders/src/main/java/.../orders/
├── config/
│   ├── KafkaConfig.java
│   ├── KafkaTopicConfig.java
│   └── SecurityConfig.java (GatewayAuthFilter)
├── domain/
│   ├── enums/OrderStatus.java
│   ├── fsm/OrderFsm.java
│   ├── entity/OrderEn.java
│   ├── entity/OrderItemEn.java
│   ├── entity/OrderStatusHistoryEn.java
│   ├── entity/PriceAgreementEn.java
│   ├── entity/OutboxEventEn.java
│   └── dto/{request,response}/...
├── repository/
│   ├── OrderRepository.java
│   ├── OrderItemRepository.java
│   └── OutboxEventRepository.java
├── service/
│   ├── OrderService.java (interface)
│   ├── SlaCalculationService.java
│   ├── PriceAgreementService.java
│   ├── OrderCancellationService.java
│   └── impl/OrderServiceImpl.java
├── saga/
│   └── OrderSagaOrchestrator.java
├── kafka/
│   ├── OutboxEventPublisher.java
│   ├── consumer/InventoryEventConsumer.java
│   ├── consumer/PaymentEventConsumer.java
│   ├── consumer/LogisticsEventConsumer.java
│   └── events/{OrderCreatedEvent, OrderCancelledEvent, ...}.java
├── controller/
│   ├── OrderController.java (interface)
│   ├── impl/OrderControllerImpl.java
│   └── BulkOrderController.java
└── exception/
    ├── OrderNotFoundException.java
    ├── InvalidOrderStatusTransitionException.java
    └── GlobalExceptionHandler.java
```
