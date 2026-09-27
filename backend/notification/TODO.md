# TODO: Notification Service — Create from Scratch

## Текущее состояние
**Директория `backend/notification/` не существует.** Нужно создать полностью.
Notification Service — это единственный сервис с STOMP/WebSocket. Остальные только REST.

---

## 🔴 КРИТИЧНО — СОЗДАТЬ СЕРВИС (Sprint 2)

### [x] 1. Инициализация Spring Boot проекта
**Команда:**
```bash
cd backend && mkdir notification && cd notification
# Скопировать build.gradle с изменениями из другого сервиса
```

**Зависимости `build.gradle`:**
```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-websocket'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'org.springframework.kafka:spring-kafka'
    implementation 'org.flywaydb:flyway-core'
    implementation 'org.flywaydb:flyway-database-postgresql'
    runtimeOnly 'org.postgresql:postgresql'
    implementation 'org.redisson:redisson-spring-boot-starter:3.32.0'
    implementation 'com.fasterxml.jackson.core:jackson-databind'
    implementation 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
}
```

### [x] 2. `application.yaml`
```yaml
server:
  port: 8086
spring:
  application:
    name: notification
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/nexlify-db}
    username: ${SPRING_DATASOURCE_USERNAME:postgres}
    password: ${SPRING_DATASOURCE_PASSWORD:postgres}
  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
  flyway:
    enabled: true
    schemas: notifications
    locations: classpath:db/migration
  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
    consumer:
      group-id: notification-service
      auto-offset-reset: earliest
```

### [x] 3. Flyway DDL — `notifications_db`
```sql
-- V1__create_notifications_schema.sql
CREATE SCHEMA IF NOT EXISTS notifications;

CREATE TABLE notifications.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID NOT NULL,    -- ID пользователя-получателя
    recipient_company_id UUID,          -- или вся компания
    notification_type VARCHAR(64) NOT NULL,  -- ORDER_STATUS_CHANGED, STOCK_LOW, INVOICE_ISSUED, etc.
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB,                         -- дополнительные данные (orderId, invoiceId и т.п.)
    channel VARCHAR(16) NOT NULL DEFAULT 'WEB', -- WEB, EMAIL, PUSH, SMS
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING', -- PENDING, SENT, READ, FAILED
    read_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications.user_notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    push_enabled BOOLEAN NOT NULL DEFAULT true,
    web_enabled BOOLEAN NOT NULL DEFAULT true,
    -- Какие типы уведомлений включены
    order_notifications BOOLEAN NOT NULL DEFAULT true,
    stock_notifications BOOLEAN NOT NULL DEFAULT true,
    invoice_notifications BOOLEAN NOT NULL DEFAULT true,
    logistics_notifications BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications.notifications(recipient_user_id, status);
CREATE INDEX idx_notifications_unread ON notifications.notifications(recipient_user_id) WHERE status = 'PENDING';
```

---

## 🔴 КРИТИЧНО — WEBSOCKET (Sprint 2)

### [x] 4. WebSocket Config — STOMP
**Файл:** `config/WebSocketConfig.java` (СОЗДАТЬ)

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/connect")
                .setAllowedOriginPatterns("http://localhost:3000", "http://localhost:5173")
                .withSockJS();  // fallback для старых браузеров
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Клиент подписывается на /user/queue/... и /topic/...
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }
}
```

STOMP-топики (из Obsidian spec):
```
/topic/orders/{tenantId}           → изменения статусов заказов (broadcast для tenant)
/topic/inventory/{tenantId}        → LOW_STOCK, OUT_OF_STOCK alerts
/user/queue/notifications          → персональные уведомления пользователя
/topic/logistics/{tenantId}        → обновления позиции ТС, ETA
/topic/rfq/{tenantId}              → новые ставки на RFQ
```

### [x] 5. WebSocket Authentication Filter
**Файл:** `config/WebSocketSecurityConfig.java` (СОЗДАТЬ)

STOMP не поддерживает Authorization header в WebSocket upgrade.
Решение: клиент передаёт токен в первом STOMP CONNECT frame.
```java
@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = accessor.getFirstNativeHeader("Authorization");
            // Валидировать opaque token через Redis
            // Установить principal в accessor
        }
        return message;
    }
}
```

### [x] 6. Kafka Consumer — все типы событий
**Файл:** `kafka/consumer/NotificationEventConsumer.java` (СОЗДАТЬ)

```java
@KafkaListener(topics = {
    "order-events",
    "inventory-events",
    "payment-events",
    "logistics-events",
    "rfq-events"
})
public void handleEvent(ConsumerRecord<String, String> record) {
    // Маппинг событий → NotificationType → recipients
    // ORDER:
    //   OrderStatusChangedEvent → {buyerId, supplierId} → ORDER_STATUS_CHANGED
    //   OrderCancelledEvent     → {buyerId} → ORDER_CANCELLED
    // INVENTORY:
    //   InventoryLowStockEvent  → {warehouseManagerId} → STOCK_LOW_ALERT
    // PAYMENT:
    //   InvoiceIssuedEvent      → {buyerAccountantId} → INVOICE_ISSUED
    //   InvoiceOverdueEvent     → {buyerId + supplierId} → PAYMENT_OVERDUE
    // LOGISTICS:
    //   VehicleLocationEvent    → /topic/logistics/{tenantId} WebSocket broadcast
    //   ShipmentDeliveredEvent  → {buyerId} → DELIVERY_CONFIRMED
    // RFQ:
    //   NewBidReceivedEvent     → {rfqCreatorId} → BID_RECEIVED
}
```

### [x] 7. Уведомления рассылатель
**Файл:** `service/NotificationDispatchService.java` (СОЗДАТЬ)

```java
@Service
public class NotificationDispatchService {

    private final SimpMessagingTemplate messagingTemplate;  // WebSocket STOMP
    private final JavaMailSender mailSender;                // Email
    private final NotificationRepository repository;
    private final UserSettingsRepository settingsRepository;

    public void dispatch(NotificationRequest request) {
        // 1. Сохранить уведомление в БД (status=PENDING)
        // 2. Получить настройки пользователя из user_notification_settings
        // 3. Если web_enabled → WebSocket push:
        messagingTemplate.convertAndSendToUser(
            userId.toString(),
            "/queue/notifications",
            NotificationPayload.from(notification)
        );
        // 4. Если email_enabled → Email через SMTP
        // 5. Обновить status=SENT
    }
}
```

---

## 🟠 ВАЖНО (Sprint 2)

### [ ] 8. Email Templates — Thymeleaf
**Директория:** `src/main/resources/templates/email/`

```
order_status_changed.html  — статус заказа изменился
invoice_issued.html        — выставлен инвойс
payment_overdue.html       — просрочка оплаты
delivery_confirmed.html    — заказ доставлен
stock_low_alert.html       — остаток товара критически низкий
```

### [x] 9. REST API — управление уведомлениями
```
GET  /api/v1/notifications           → Page<NotificationResponse> (только свои)
GET  /api/v1/notifications/unread-count → {count: 5}
PATCH /api/v1/notifications/{id}/read → пометить прочитанным
PATCH /api/v1/notifications/read-all  → все прочитаны
GET  /api/v1/notifications/settings   → текущие настройки
PUT  /api/v1/notifications/settings   → обновить настройки
```

### [x] 10. Retry для недоставленных уведомлений
**Файл:** `scheduler/NotificationRetryScheduler.java` (СОЗДАТЬ)

```java
@Scheduled(fixedDelay = 60000)  // каждую минуту
public void retryFailedNotifications() {
    // SELECT * FROM notifications WHERE status = 'FAILED' AND created_at > NOW() - INTERVAL '24h'
    // Попробовать отправить ещё раз (max 3 попытки)
    // После 3 неудач → status = 'DEAD'
}
```

---

## 📁 Структура для создания
```
backend/notification/
├── build.gradle
├── src/main/java/.../notification/
│   ├── NotificationApplication.java
│   ├── config/{WebSocketConfig, WebSocketSecurityConfig, KafkaConfig, MailConfig, SecurityConfig}.java
│   ├── domain/entity/{NotificationEn, UserNotificationSettingsEn}.java
│   ├── domain/dto/{NotificationResponse, NotificationSettingsRequest, ...}.java
│   ├── kafka/consumer/NotificationEventConsumer.java
│   ├── service/{NotificationDispatchService, WebSocketNotificationService}.java
│   ├── scheduler/NotificationRetryScheduler.java
│   └── controller/NotificationController.java
├── src/main/resources/
│   ├── application.yaml
│   ├── db/migration/V1__create_notifications_schema.sql
│   └── templates/email/{order_status_changed.html, invoice_issued.html, ...}
└── src/test/...
```

## ⚠️ Не забыть
- Добавить `notification` в `Configuration/compose.yml` → порт 8086
- Добавить маршрут в Gateway `application.yaml` (уже есть для `/api/v1/notifications/**`)
- Добавить WebSocket маршрут в Gateway: `/ws/**`
- В Gateway SecurityConfig: WebSocket path `/ws/**` — без OpaqueToken (auth в CONNECT frame)
