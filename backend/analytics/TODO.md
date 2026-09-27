# TODO: Analytics Service — Full Implementation Required

## Текущее состояние
Каркас: application, security config, AnalyticsController-mock (без имплементации). Полная реализация отсутствует.
Analytics — агрегирует события из всех сервисов и вычисляет KPI-метрики для дашбордов.

---

## 🔴 КРИТИЧНО — ФУНДАМЕНТ (Sprint 3)

### [x] 1. Gradle + application.yaml
Порт: `8087`. Зависимости: JPA, Kafka, Flyway, PostgreSQL.

### [x] 2. Flyway DDL — `analytics_db`

Analytics — read-side сервис. Он **не модифицирует** данные других сервисов,
только потребляет события через Kafka и хранит агрегированные метрики.

```sql
-- V1__create_analytics_schema.sql
CREATE SCHEMA IF NOT EXISTS analytics;

-- Материализованная таблица заказов (event-sourced из order-events)
CREATE TABLE analytics.order_facts (
    id UUID PRIMARY KEY,              -- order_id
    tenant_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    supplier_id UUID,
    status VARCHAR(32) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    total_amount NUMERIC(15,2),
    created_date DATE NOT NULL,
    submitted_date DATE,
    paid_date DATE,
    shipped_date DATE,
    delivered_date DATE,
    delivery_city VARCHAR(128),
    items_count INT,
    lead_time_days INT,               -- от SUBMITTED до DELIVERED
    is_on_time BOOLEAN,               -- OTIF: доставлено вовремя?
    is_in_full BOOLEAN,               -- OTIF: доставлено в полном объёме?
    sla_met BOOLEAN,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Складские события (из inventory-events)
CREATE TABLE analytics.stock_facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_date DATE NOT NULL,
    tenant_id UUID NOT NULL,
    product_id UUID NOT NULL,
    sku VARCHAR(128),
    warehouse_id UUID,
    event_type VARCHAR(32) NOT NULL,  -- RESERVED, RELEASED, RECEIVED, WRITTEN_OFF
    quantity INT NOT NULL,
    unit_cost NUMERIC(12,2),
    total_cost NUMERIC(15,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Финансовые события (из payment-events)
CREATE TABLE analytics.payment_facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL,
    order_id UUID NOT NULL,
    buyer_company_id UUID NOT NULL,
    supplier_company_id UUID NOT NULL,
    net_amount NUMERIC(15,2) NOT NULL,
    vat_amount NUMERIC(15,2) NOT NULL,
    gross_amount NUMERIC(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    payment_terms VARCHAR(16),
    due_date DATE,
    paid_date DATE,
    days_to_pay INT,                  -- фактические дни оплаты (для DSO расчёта)
    is_overdue BOOLEAN DEFAULT false,
    issue_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Предрасчитанные KPI снэпшоты (обновляются по расписанию)
CREATE TABLE analytics.kpi_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    period_type VARCHAR(8) NOT NULL,  -- DAILY, WEEKLY, MONTHLY
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    -- Order KPIs
    total_orders INT DEFAULT 0,
    orders_completed INT DEFAULT 0,
    orders_cancelled INT DEFAULT 0,
    total_revenue NUMERIC(15,2) DEFAULT 0,
    otif_rate NUMERIC(5,2),           -- % On-Time In-Full
    avg_lead_time_days NUMERIC(6,2),
    -- Inventory KPIs
    inventory_turnover_ratio NUMERIC(8,4),  -- ITR = COGS / avg_inventory_value
    avg_stock_level NUMERIC(12,2),
    stockout_events INT DEFAULT 0,
    -- Financial KPIs
    total_invoiced NUMERIC(15,2) DEFAULT 0,
    total_collected NUMERIC(15,2) DEFAULT 0,
    accounts_receivable NUMERIC(15,2) DEFAULT 0,
    dso_days NUMERIC(6,2),            -- Days Sales Outstanding
    overdue_amount NUMERIC(15,2) DEFAULT 0,
    -- Supplier KPIs
    avg_supplier_fill_rate NUMERIC(5,2),
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, period_type, period_start)
);

CREATE INDEX idx_order_facts_tenant_date ON analytics.order_facts(tenant_id, created_date);
CREATE INDEX idx_payment_facts_tenant ON analytics.payment_facts(buyer_company_id, issue_date);
```

---

## 🔴 КРИТИЧНО — БИЗНЕС-ЛОГИКА (Sprint 3)

### [x] 3. KPI Calculation Service
**Файл:** `service/KpiCalculationService.java` (СОЗДАТЬ)

Из Obsidian spec — формулы:

```java
@Service
public class KpiCalculationService {

    // OTIF (On-Time In-Full) — главная SCM метрика
    // OTIF% = (orders_on_time_and_in_full / total_orders_delivered) × 100
    public BigDecimal calculateOtif(UUID tenantId, LocalDate from, LocalDate to) {
        long delivered = orderFactsRepository.countDelivered(tenantId, from, to);
        long otif = orderFactsRepository.countOtif(tenantId, from, to);
        return delivered == 0 ? ZERO : BigDecimal.valueOf(otif * 100.0 / delivered);
    }

    // ITR (Inventory Turnover Ratio)
    // ITR = COGS / ((opening_stock_value + closing_stock_value) / 2)
    // COGS = сумма стоимости реализованных товаров за период
    public BigDecimal calculateInventoryTurnoverRatio(UUID tenantId, int year, int month) { ... }

    // DSO (Days Sales Outstanding)
    // DSO = (accounts_receivable / total_credit_sales) × days_in_period
    public BigDecimal calculateDso(UUID tenantId, LocalDate from, LocalDate to) { ... }

    // Order Lead Time (среднее время от SUBMITTED до DELIVERED)
    public BigDecimal calculateAvgLeadTime(UUID tenantId, LocalDate from, LocalDate to) { ... }

    // Supplier Fill Rate (% позиций выполнен от всех заказанных у поставщика)
    public BigDecimal calculateSupplierFillRate(UUID supplierId, LocalDate from, LocalDate to) { ... }
}
```

### [x] 4. Kafka Consumers — агрегация событий
**Файл:** `kafka/consumer/AnalyticsEventConsumer.java` (СОЗДАТЬ)

```java
@KafkaListener(topics = {"order-events", "payment-events", "inventory-events"})
public void processEvent(ConsumerRecord<String, String> record) {
    // ORDER events:
    //   OrderCreatedEvent → INSERT INTO order_facts
    //   OrderStatusChangedEvent → UPDATE order_facts SET status, *_date, lead_time_days, is_on_time
    
    // PAYMENT events:
    //   InvoiceIssuedEvent → INSERT INTO payment_facts
    //   PaymentSucceededEvent → UPDATE payment_facts SET paid_date, days_to_pay
    //   InvoiceOverdueEvent → UPDATE payment_facts SET is_overdue = true
    
    // INVENTORY events:
    //   StockReservedEvent → INSERT INTO stock_facts (RESERVED)
    //   InventoryLowStockEvent → stockout_events++
    
    // Все через Transactional Outbox pattern (consumed_events для идемпотентности)
}
```

### [ ] 5. KPI Snapshot Scheduler
**Файл:** `scheduler/KpiSnapshotScheduler.java` (СОЗДАТЬ)

```java
@Scheduled(cron = "0 0 2 * * *")  // каждый день в 02:00
public void computeDailySnapshots() {
    LocalDate yesterday = LocalDate.now().minusDays(1);
    // Для каждого tenant:
    kpiCalculationService.computeAndSaveSnapshot(tenantId, DAILY, yesterday, yesterday);
}

@Scheduled(cron = "0 0 3 * * MON")  // каждый понедельник в 03:00
public void computeWeeklySnapshots() { ... }

@Scheduled(cron = "0 0 4 1 * *")  // 1-го числа каждого месяца в 04:00
public void computeMonthlySnapshots() { ... }
```

---

## 🟠 ВАЖНО (Sprint 3)

### [x] 6. REST API — дашборды
```
# Executive Dashboard
GET /api/v1/analytics/dashboard
  ?tenantId={id}&period=30d|90d|1y
  → {otif%, avgLeadTime, totalRevenue, inventoryTurnover, dso, topSuppliers[5], topProducts[5]}

# Order Analytics
GET /api/v1/analytics/orders
  ?from=2026-01-01&to=2026-09-30&groupBy=month|week|day
  → List<{period, count, revenue, cancelRate, otif%}>

GET /api/v1/analytics/orders/funnel
  → {draft:N, submitted:N, reserved:N, paid:N, shipped:N, delivered:N, cancelled:N}

# Inventory Analytics
GET /api/v1/analytics/inventory
  ?warehouseId=...&period=30d
  → {turnoverRatio, avgDaysOnHand, stockoutEvents, topMovingSkus[10], slowMovingSkus[10]}

GET /api/v1/analytics/inventory/abc-xyz
  ?supplierId=...
  → матрица ABC/XYZ (делегировать к Inventory Service)

# Financial Analytics
GET /api/v1/analytics/finance
  ?tenantId={id}&period=30d
  → {totalRevenue, totalInvoiced, collected, accountsReceivable, dso, overdueAmount, overdueRate%}

GET /api/v1/analytics/finance/aging
  → Реестр дебиторской задолженности с aging buckets (0-30, 31-60, 61-90, 90+ дней)

# Supplier Analytics
GET /api/v1/analytics/suppliers/{supplierId}
  → {fillRate, avgLeadTime, onTimeDeliveryRate, totalOrders, totalRevenue, defectRate}

GET /api/v1/analytics/suppliers/ranking
  ?period=90d&sortBy=fill_rate|lead_time|revenue
  → Page<SupplierRankingResponse>

# Export
GET /api/v1/analytics/reports/export
  ?type=orders|finance|inventory&format=csv|xlsx&from=...&to=...
  → File download
```

### [ ] 7. XLSX/CSV Export
**Файл:** `service/ReportExportService.java` (СОЗДАТЬ)

Использовать `Apache POI` для XLSX:
```groovy
implementation 'org.apache.poi:poi-ooxml:5.2.5'
```

---

## 📁 Файлы для создания
```
backend/analytics/src/main/java/.../analytics/
├── config/{KafkaConfig, SecurityConfig}.java
├── domain/entity/{OrderFactEn, StockFactEn, PaymentFactEn, KpiSnapshotEn}.java
├── domain/dto/{DashboardResponse, OrderAnalyticsResponse, FinanceAnalyticsResponse, ...}.java
├── kafka/consumer/AnalyticsEventConsumer.java
├── repository/{OrderFactRepository, PaymentFactRepository, KpiSnapshotRepository}.java
├── service/{KpiCalculationService, ReportExportService, TenantAnalyticsService}.java
├── scheduler/KpiSnapshotScheduler.java
└── controller/{AnalyticsController, ReportExportController}.java  (interface + impl)
```
