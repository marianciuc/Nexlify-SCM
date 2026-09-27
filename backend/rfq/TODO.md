# TODO: RFQ & Bidding Engine — Full Implementation Required

## Текущее состояние
Каркас: application, security config, RfqController-mock, RfqDto, BidDto. Полная имплементация отсутствует.
RFQ — ключевой B2B-дифференциатор платформы: тендерная доска для публичных заявок на поставку.

---

## 🔴 КРИТИЧНО — ФУНДАМЕНТ (Sprint 2)

### [x] 1. Flyway DDL — `rfq_db`

Из Obsidian spec (файл 23) — используется `orders_db`, но мы разнесём в `rfq` schema:

```sql
-- V1__create_rfq_schema.sql
CREATE SCHEMA IF NOT EXISTS rfq;

CREATE TABLE rfq.requests (  -- Заявки на предложение (Requests for Quotation)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_number VARCHAR(64) UNIQUE NOT NULL,   -- RFQ-2026-XXXXX
    buyer_company_id UUID NOT NULL,            -- компания-покупатель из user_db
    tenant_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT', -- DRAFT, PUBLISHED, EVALUATING, AWARDED, CANCELLED, EXPIRED
    deadline TIMESTAMPTZ NOT NULL,             -- срок подачи предложений
    delivery_date DATE,                        -- желаемая дата доставки
    delivery_address TEXT,
    delivery_city VARCHAR(128),
    budget_amount NUMERIC(15,2),               -- максимальный бюджет (может быть скрыт)
    budget_hidden BOOLEAN DEFAULT false,       -- скрыть бюджет от поставщиков
    currency VARCHAR(3) NOT NULL DEFAULT 'PLN',
    payment_terms VARCHAR(16) DEFAULT 'NET_30',
    awarded_bid_id UUID,                       -- ID выбранного предложения
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rfq.rfq_items (  -- Позиции заявки
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfq.requests(id) ON DELETE CASCADE,
    sku VARCHAR(128),
    product_name VARCHAR(255) NOT NULL,
    quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
    unit_of_measure VARCHAR(16) NOT NULL DEFAULT 'PCE',
    description TEXT,
    allow_alternatives BOOLEAN DEFAULT false,  -- разрешить аналоги
    required_certifications TEXT[]             -- требуемые сертификаты поставщика
);

CREATE TABLE rfq.bids (  -- Предложения от поставщиков
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfq.requests(id) ON DELETE CASCADE,
    supplier_company_id UUID NOT NULL,         -- компания-поставщик из user_db
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED', -- SUBMITTED, UNDER_REVIEW, ACCEPTED, REJECTED, WITHDRAWN
    total_price NUMERIC(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'PLN',
    delivery_date DATE,                        -- предлагаемая дата доставки
    payment_terms VARCHAR(16),
    validity_days INT NOT NULL DEFAULT 30,     -- срок действия предложения
    valid_until DATE,
    notes TEXT,
    score NUMERIC(5,2),                        -- расчётный балл для сравнения
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rfq.bid_items (  -- Позиции предложения
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bid_id UUID NOT NULL REFERENCES rfq.bids(id) ON DELETE CASCADE,
    rfq_item_id UUID NOT NULL REFERENCES rfq.rfq_items(id),
    offered_sku VARCHAR(128),                  -- если предлагается аналог
    product_name VARCHAR(255),
    quantity NUMERIC(12,3) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    total_price NUMERIC(15,2) NOT NULL,
    is_alternative BOOLEAN DEFAULT false,      -- это аналог?
    alternative_reason TEXT,
    lead_time_days INT,                        -- срок поставки для этой позиции
    vat_rate NUMERIC(5,2) DEFAULT 23
);

CREATE TABLE rfq.rfq_invitations (  -- Приглашённые поставщики (для закрытых тендеров)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfq.requests(id) ON DELETE CASCADE,
    supplier_company_id UUID NOT NULL,
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    UNIQUE (rfq_id, supplier_company_id)
);

CREATE TABLE rfq.bid_comparison_matrix (  -- Матрица сравнения предложений
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID NOT NULL REFERENCES rfq.requests(id),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    matrix_data JSONB NOT NULL,  -- структурированные данные для таблицы сравнения
    generated_by UUID NOT NULL   -- userId кто запросил
);

CREATE INDEX idx_rfq_requests_status ON rfq.requests(status);
CREATE INDEX idx_rfq_requests_deadline ON rfq.requests(deadline) WHERE status = 'PUBLISHED';
CREATE INDEX idx_rfq_bids_rfq ON rfq.bids(rfq_id, status);
CREATE INDEX idx_rfq_bids_supplier ON rfq.bids(supplier_company_id);
```

---

## 🔴 КРИТИЧНО — БИЗНЕС-ЛОГИКА (Sprint 2)

### [x] 2. RFQ Lifecycle Service
**Файл:** `service/RfqLifecycleService.java` (СОЗДАТЬ)

```
FSM переходы:
DRAFT → PUBLISHED (buyer публикует тендер, Kafka event → Notification для приглашённых поставщиков)
PUBLISHED → EVALUATING (дедлайн прошёл, автоматически через Scheduler или вручную)
EVALUATING → AWARDED (buyer выбирает bid, AWARDED включает bid → Order Service создаёт заказ)
EVALUATING → CANCELLED (нет подходящих предложений)
PUBLISHED → CANCELLED (buyer отзывает)
* → EXPIRED (deadline прошёл, нет ни одного bid)
```

### [x] 3. Bid Scoring Algorithm
**Файл:** `service/BidScoringService.java` (СОЗДАТЬ)

Из Obsidian spec: расчёт composite score:
```java
// score = w_price * price_score + w_delivery * delivery_score + w_quality * quality_score

// price_score = (min_price / bid_price) * 100  (100 = cheapest bid)
// delivery_score = (requested_date - bid.delivery_date) normalized
// quality_score = supplier.rating из User Service

// Веса по умолчанию: price=0.6, delivery=0.3, quality=0.1
// Buyer может настроить веса через PUT /api/v1/rfq/{rfqId}/scoring-weights
```

### [ ] 4. Альтернативы (Аналоги)
**Файл:** `service/AlternativeMatchingService.java` (СОЗДАТЬ)

Одна из ключевых фич (экран P20 в Obsidian):
```java
// При отображении матрицы сравнения — автоматически подбирать аналоги:
// 1. По category + keywords из product_name
// 2. По EAN/GTIN совместимости
// 3. По certifications match
// Если bid_item.is_alternative = true → отдельная вкладка "Аналоги"

// GET /api/v1/rfq/{rfqId}/alternatives → List<AlternativeMatch>{
//   originalSku, alternativeSku, supplierName, price, deliveryDate, similarityScore
// }
```

### [x] 5. Award → Order creation (Inter-service flow)
**Файл:** `service/AwardService.java` (СОЗДАТЬ)

```java
public OrderCreatedFromBid awardBid(UUID rfqId, UUID bidId, UUID buyerUserId) {
    // 1. Validate: rfq.status = EVALUATING, bid.status = SUBMITTED
    // 2. Update rfq.status = AWARDED, rfq.awarded_bid_id = bidId
    // 3. Update winning_bid.status = ACCEPTED
    // 4. Update losing_bids.status = REJECTED
    // 5. Publish RfqAwardedEvent → Order Service создаёт заказ автоматически:
    //    {rfqId, bidId, buyerCompanyId, supplierCompanyId, items, totalPrice, paymentTerms}
    // 6. Publish через Kafka RfqBidRejectedEvent для loser-поставщиков
    // 7. Notification Service → уведомить победителя и проигравших
}
```

### [x] 6. Kafka Events
**Файл:** `kafka/events/` (СОЗДАТЬ)
- `RfqPublishedEvent` → Notification: уведомить приглашённых поставщиков
- `RfqDeadlineApproachingEvent` (24ч до) → Notification: напомнить поставщикам
- `RfqAwardedEvent` → Order Service: создать заказ
- `RfqBidReceivedEvent` → Notification: покупатель получил новую ставку
- `RfqBidRejectedEvent` → Notification: поставщику-проигравшему

### [x] 7. RFQ Deadline Scheduler
**Файл:** `scheduler/RfqDeadlineScheduler.java` (СОЗДАТЬ)

```java
@Scheduled(cron = "0 */5 * * * *")  // каждые 5 минут
public void processDeadlines() {
    // Найти PUBLISHED RFQ где deadline прошёл
    // Если есть bids → перевести в EVALUATING
    // Если нет bids → перевести в EXPIRED
    
    // Найти PUBLISHED RFQ где deadline через 24 часа
    // Опубликовать RfqDeadlineApproachingEvent
}
```

---

## 🟠 ВАЖНО (Sprint 2)

### [x] 8. REST API — полный контракт
```
# Buyer:
GET    /api/v1/rfq                            → Page<RfqSummaryResponse> (свои RFQ)
GET    /api/v1/rfq/{id}                       → RfqDetailResponse (с bids count)
POST   /api/v1/rfq                            → создать RFQ (DRAFT)
PUT    /api/v1/rfq/{id}                       → обновить (только DRAFT)
POST   /api/v1/rfq/{id}/publish               → DRAFT → PUBLISHED
POST   /api/v1/rfq/{id}/award/{bidId}         → наградить поставщика
GET    /api/v1/rfq/{id}/bids                  → все предложения (только buyer)
GET    /api/v1/rfq/{id}/comparison            → матрица сравнения предложений
GET    /api/v1/rfq/{id}/alternatives          → аналоги
PUT    /api/v1/rfq/{id}/scoring-weights       → настроить веса для scoring
POST   /api/v1/rfq/{id}/cancel                → отменить

# Supplier:
GET    /api/v1/rfq/board                      → публичная доска (все PUBLISHED, фильтр по категории)
GET    /api/v1/rfq/{id}/public                → детали RFQ для поставщика (без скрытых данных)
POST   /api/v1/rfq/{id}/bids                  → подать предложение
PUT    /api/v1/rfq/{id}/bids/{bidId}          → обновить (пока SUBMITTED)
DELETE /api/v1/rfq/{id}/bids/{bidId}          → отозвать предложение (WITHDRAWN)
GET    /api/v1/rfq/my-bids                    → все свои ставки

# Analytics (для обоих ролей):
GET    /api/v1/rfq/stats                      → win_rate, avg_bids_per_rfq, avg_savings_percent
```

---

## 📁 Файлы для создания
```
backend/rfq/src/main/java/.../rfq/
├── config/{KafkaConfig, SecurityConfig}.java
├── domain/entity/{RfqRequestEn, RfqItemEn, BidEn, BidItemEn, RfqInvitationEn}.java
├── domain/dto/{request/CreateRfqRequest, SubmitBidRequest, ...}
│            {response/RfqSummaryResponse, RfqDetailResponse, BidComparisonResponse, ...}
├── domain/enums/{RfqStatus, BidStatus}.java
├── kafka/consumer/{OrderEventConsumer}.java  ← слушать OrderCreatedFromBid confirmation
├── kafka/events/{RfqPublishedEvent, RfqAwardedEvent, RfqBidReceivedEvent, ...}.java
├── service/{RfqLifecycleService, BidScoringService, AlternativeMatchingService, AwardService}.java
├── scheduler/RfqDeadlineScheduler.java
├── controller/{RfqBuyerController, RfqSupplierController, RfqStatsController}.java (interface + impl)
└── exception/{RfqNotFoundException, BidNotFoundException, InvalidRfqStateException, ...}.java

src/main/resources/db/migration/V1-V3__*.sql
```
