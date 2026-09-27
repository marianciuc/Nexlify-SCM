# TODO: Billing Service — Full Implementation Required

## Текущее состояние
Каркас: 4 файла — application, security config, BillingController-mock, InvoiceDto. Полная имплементация отсутствует.
Это финансовый сервис — наибольшая юридическая ответственность (польское налоговое законодательство).

---

## 🔴 КРИТИЧНО — ФУНДАМЕНТ (Sprint 2)

### [x] 1. Flyway DDL — `billing_db`
```sql
-- V1__create_billing_schema.sql
CREATE SCHEMA IF NOT EXISTS billing;

CREATE TABLE billing.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(64) UNIQUE NOT NULL,  -- FV/2026/09/XXXXX (польский стандарт)
    invoice_type VARCHAR(16) NOT NULL DEFAULT 'SALES', -- SALES, CORRECTION, PROFORMA, ADVANCE
    order_id UUID NOT NULL,            -- из order_db
    seller_company_id UUID NOT NULL,   -- из user_db
    buyer_company_id UUID NOT NULL,    -- из user_db
    seller_nip VARCHAR(16) NOT NULL,
    buyer_nip VARCHAR(16) NOT NULL,
    seller_name VARCHAR(255) NOT NULL,
    buyer_name VARCHAR(255) NOT NULL,
    seller_address TEXT NOT NULL,
    buyer_address TEXT NOT NULL,
    issue_date DATE NOT NULL,
    sale_date DATE NOT NULL,           -- дата продажи (совпадает с датой отгрузки)
    due_date DATE NOT NULL,            -- срок оплаты
    payment_terms VARCHAR(16) NOT NULL DEFAULT 'NET_30',
    currency VARCHAR(3) NOT NULL DEFAULT 'PLN',
    net_amount NUMERIC(15,2) NOT NULL,
    vat_amount NUMERIC(15,2) NOT NULL,
    gross_amount NUMERIC(15,2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT', -- DRAFT, ISSUED, PAID, OVERDUE, CANCELLED, DISPUTED
    payment_method VARCHAR(32) DEFAULT 'BANK_TRANSFER', -- BANK_TRANSFER, CARD, STRIPE
    stripe_payment_intent_id VARCHAR(255),
    stripe_payment_status VARCHAR(32),
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE billing.invoice_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES billing.invoices(id) ON DELETE CASCADE,
    line_number INT NOT NULL,
    sku VARCHAR(128),
    description VARCHAR(255) NOT NULL,
    quantity NUMERIC(12,3) NOT NULL,
    unit_of_measure VARCHAR(16) NOT NULL DEFAULT 'PCE',
    unit_price_net NUMERIC(12,2) NOT NULL,
    discount_percent NUMERIC(5,2) DEFAULT 0,
    vat_rate NUMERIC(5,2) NOT NULL DEFAULT 23,  -- Polish VAT: 0, 5, 8, 23
    net_amount NUMERIC(15,2) NOT NULL,
    vat_amount NUMERIC(15,2) NOT NULL,
    gross_amount NUMERIC(15,2) NOT NULL
);

CREATE TABLE billing.credit_notes (  -- Faktury korygujące (корректирующие инвойсы)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_note_number VARCHAR(64) UNIQUE NOT NULL,  -- FV-KOR/2026/09/XXXXX
    original_invoice_id UUID NOT NULL REFERENCES billing.invoices(id),
    order_id UUID NOT NULL,
    reason TEXT NOT NULL,
    net_adjustment NUMERIC(15,2) NOT NULL,   -- отрицательное значение = возврат
    vat_adjustment NUMERIC(15,2) NOT NULL,
    gross_adjustment NUMERIC(15,2) NOT NULL,
    issue_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ISSUED',
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE billing.payment_events (  -- история платежей / Stripe webhooks
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES billing.invoices(id),
    stripe_event_id VARCHAR(255) UNIQUE,   -- для идемпотентности
    event_type VARCHAR(64) NOT NULL,        -- payment_intent.succeeded, charge.refunded
    amount NUMERIC(15,2),
    currency VARCHAR(3),
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    raw_payload JSONB                       -- сохранить оригинальный Stripe payload
);

CREATE INDEX idx_invoices_order ON billing.invoices(order_id);
CREATE INDEX idx_invoices_status ON billing.invoices(status);
CREATE INDEX idx_invoices_due_date ON billing.invoices(due_date) WHERE status NOT IN ('PAID', 'CANCELLED');
```

---

## 🔴 КРИТИЧНО — БИЗНЕС-ЛОГИКА (Sprint 2)

### [x] 2. Invoice Generator — Faktura VAT
**Файл:** `service/InvoiceGeneratorService.java` (СОЗДАТЬ)

```java
@Service
public class InvoiceGeneratorService {

    // Генерация уникального номера по польскому стандарту: FV/{year}/{month}/{padded_sequence}
    public String generateInvoiceNumber(String year, String month) {
        // SELECT MAX(CAST(SUBSTRING(invoice_number FROM 'FV/\d{4}/\d{2}/(\d+)') AS INT)) + 1
        // Thread-safe через RedissonClient.getAtomicLong("invoice:counter:{year}:{month}")
    }

    // Вычисление сумм с польскими ставками НДС (0%, 5%, 8%, 23%)
    public InvoiceTotals calculateTotals(List<InvoiceLineRequest> lines) {
        // Группировать строки по ставке НДС
        // NET = sum(qty * unit_price * (1 - discount/100))
        // VAT = NET * vat_rate
        // GROSS = NET + VAT
    }

    // Создание инвойса из OrderPaidEvent
    public InvoiceEn createFromOrder(OrderPaidEvent event) {
        // Обогатить данными компаний из User Service (REST call или Kafka state)
        // Заполнить NIP, адрес продавца и покупателя
        // issue_date = today, sale_date = delivery_date, due_date = today + 30/60 days
    }
}
```

### [ ] 3. PDF Generator — Faktura VAT PDF
**Файл:** `service/InvoicePdfGeneratorService.java` (СОЗДАТЬ)

Использовать `iText 7` или `Thymeleaf + Flying Saucer (PDF renderer)`.
Требования к польской Faktura VAT:
- Название: "FAKTURA VAT" или "FAKTURA" (от 2014 г.)
- Numer: уникальный последовательный
- Data wystawienia + Data sprzedaży
- Dane sprzedawcy: nazwa, adres, NIP
- Dane nabywcy: nazwa, adres, NIP
- Tabela pozycji: opis, ilość, jm, cena netto, stawka VAT, kwota VAT, wartość brutto
- Podsumowanie w podziale na stawki VAT
- Łączna kwota do zapłaty słownie (в скриптах на польском)
- Termin płatności + numer rachunku bankowego

```java
// Шаблон: src/main/resources/templates/invoice.html (Thymeleaf)
// Генерация: Flying Saucer HtmlDocumentRenderer → PDDocument
// Загрузить PDF в MinIO/S3, вернуть pdf_url
```
Добавить зависимости: `itext7-core`, `flying-saucer-pdf`, `thymeleaf-spring6`
Добавить зависимость: `io.minio:minio:8.5.10` (для хранения PDF)

### [x] 4. Stripe Integration
**Файл:** `service/StripePaymentService.java` (СОЗДАТЬ)

```java
@Service
public class StripePaymentService {

    private final String stripeSecretKey;  // из env STRIPE_SECRET_KEY

    // Создать PaymentIntent для заказа (для card payment)
    public String createPaymentIntent(UUID invoiceId, BigDecimal amount, String currency) {
        // Stripe.apiKey = stripeSecretKey
        // PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
        //     .setAmount(amount.multiply(100).longValue())  // в копейках/грошах
        //     .setCurrency(currency.toLowerCase())
        //     .putMetadata("invoice_id", invoiceId.toString())
        //     .build();
        // return PaymentIntent.create(params).getClientSecret();
    }

    // Верификация Stripe Webhook подписи
    public Event constructWebhookEvent(String payload, String signature) {
        // Webhook.constructEvent(payload, signature, stripeWebhookSecret)
    }
}
```

### [x] 5. Stripe Webhook Handler
**Файл:** `controller/StripeWebhookController.java` (СОЗДАТЬ)

```java
@PostMapping("/api/v1/billing/webhooks/stripe")
public ResponseEntity<String> handleWebhook(
    @RequestBody String payload,
    @RequestHeader("Stripe-Signature") String signature
) {
    // 1. stripePaymentService.constructWebhookEvent(payload, signature)
    // 2. Проверить идемпотентность: payment_events.stripe_event_id
    // 3. Обработать типы:
    //    - payment_intent.succeeded → invoiceService.markAsPaid(invoiceId)
    //    - payment_intent.payment_failed → invoiceService.markAsFailed(invoiceId)
    //    - charge.refunded → billingService.processRefund(chargeId, amount)
    // 4. Сохранить в payment_events
    // 5. Publish PaymentSucceededEvent / PaymentFailedEvent через Kafka Outbox
    return ResponseEntity.ok("OK");
}
```
**ВАЖНО:** Этот endpoint должен быть исключён из OpaqueToken проверки в Gateway!
Добавить в Gateway SecurityConfig whitelist: `/api/v1/billing/webhooks/stripe`

### [x] 6. Kafka Consumer — OrderPaidEvent / OrderCancelledEvent
**Файл:** `kafka/consumer/OrderEventConsumer.java` (СОЗДАТЬ)

```java
// onOrderPaid → InvoiceGeneratorService.createFromOrder() → PDF → mark invoice ISSUED
// onOrderCancelled + invoice was PAID → generate credit note (Faktura Korygująca)
// onOrderDelivered → если payment_terms = NET_30 → invoice due_date = NOW + 30 days (запустить таймер)
```

### [x] 7. Overdue Invoice Scheduler
**Файл:** `scheduler/OverdueInvoiceScheduler.java` (СОЗДАТЬ)

```java
@Scheduled(cron = "0 0 8 * * *")  // каждый день в 8:00
public void processOverdueInvoices() {
    // SELECT * FROM billing.invoices WHERE status = 'ISSUED' AND due_date < NOW()
    // Для каждого:
    //   - Обновить status = 'OVERDUE'
    //   - Publish InvoiceOverdueEvent → Notification Service
    //   - Опционально: рассчитать штрафные проценты (польское право: НБП + 10% годовых)
}
```

---

## 🟠 ВАЖНО (Sprint 3)

### [ ] 8. Net-30/60 Credit Facility
**Файл:** `service/CreditFacilityService.java` (СОЗДАТЬ)

Перед выставлением NET-30 инвойса:
1. Запросить `GET /api/v1/companies/{buyerId}/credit-limit/check?amount={invoiceAmount}` у User Service
2. Если кредитный лимит превышен → предложить PREPAY вместо NET-30
3. Учитывать все открытые (неоплаченные) инвойсы этого покупателя в расчёте "used credit"

### [x] 9. REST API — полный контракт
```
GET    /api/v1/billing/invoices                     → Page<InvoiceSummaryResponse>
GET    /api/v1/billing/invoices/{id}                → InvoiceDetailResponse
GET    /api/v1/billing/invoices/{id}/pdf            → redirect к S3/MinIO URL
GET    /api/v1/billing/invoices/order/{orderId}      → инвойс по заказу
POST   /api/v1/billing/invoices/{id}/payment-intent → Stripe PaymentIntent clientSecret
GET    /api/v1/billing/credit-notes                 → реестр корректирующих инвойсов
POST   /api/v1/billing/credit-notes                 → создать вручную
GET    /api/v1/billing/stats                        → total receivables, overdue amount, paid this month
POST   /api/v1/billing/webhooks/stripe              → Stripe webhook (PUBLIC, без токена)
```

### [ ] 10. KSeF Integration (опционально, Sprint 4)
Польский **Krajowy System e-Faktur** — с 2025 года обязателен для B2B.
```java
// KsefClientService.java — отправить подписанный XML в KSeF API
// Получить KSeF нумер (KSEF_NUMER), добавить в поле invoices.ksef_number
// POST https://ksef.mf.gov.pl/api/online/Invoice/Send
```

---

## 📁 Файлы для создания
```
backend/billing/src/main/java/.../billing/
├── config/{KafkaConfig, SecurityConfig, MinioConfig, StripeConfig}.java
├── domain/entity/{InvoiceEn, InvoiceLineEn, CreditNoteEn, PaymentEventEn}.java
├── domain/dto/{request,response}/...
├── kafka/consumer/OrderEventConsumer.java
├── kafka/events/{PaymentSucceededEvent, PaymentFailedEvent, InvoiceIssuedEvent}.java
├── service/{InvoiceGeneratorService, InvoicePdfGeneratorService, StripePaymentService,
│            CreditFacilityService, CreditNoteService}.java
├── scheduler/OverdueInvoiceScheduler.java
├── controller/{BillingController, StripeWebhookController}.java
└── exception/{InvoiceNotFoundException, InsufficientCreditLimitException, ...}.java

src/main/resources/
├── db/migration/V1-V3__*.sql
├── templates/invoice.html    ← Thymeleaf шаблон для PDF
└── application.yaml          ← добавить stripe.secret-key, minio config
```
