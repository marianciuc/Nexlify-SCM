# TODO: API Gateway — Production Readiness

## Текущее состояние
Gateway запускается, маршрутизирует к 8 сервисам, имеет `OpaqueTokenGlobalFilter`, Circuit Breaker (Resilience4j), CORS,
Rate Limiting в конфиге, logging-фильтр, fallback-контроллер, OpenAPI-агрегацию.

---

## 🔴 КРИТИЧНО — БЕЗОПАСНОСТЬ (Сделать до первого PR)
 
### [x] 1. OpaqueTokenGlobalFilter — реальная валидация токена через Redis
**Файл:** `filters/OpaqueTokenGlobalFilter.java` (РЕАЛИЗОВАНО)
- Валидация через ReactiveStringRedisTemplate
- Десериализация SessionData из JSON
- Защита от подделки заголовков (strip X-User-Id, X-User-Roles, X-Tenant-Id, X-Environment)
- Инжекция verified заголовков downstream-сервисам

### [x] 2. Rate Limiting — подключить реальный Redis Rate Limiter
**Файл:** `config/RateLimiterConfig.java` (РЕАЛИЗОВАНО)
- `tenantKeyResolver` с приоритетом X-Tenant-Id -> Bearer token -> Remote### [x] 4. Circuit Breaker — настроить для всех 8 маршрутов
**Файл:** `application.yml` — настроен default config и экземпляры для всех сервисов

### [x] 5. Correlation ID — генерация и прокидывание
**Файл:** `filters/RequestResponseLoggingGlobalFilter.java` — генерация X-Correlation-Id, логирование latency и инжекция в запрос/ответ

### [x] 6. WebSocket проксирование для Notification Service
**Файл:** `application.yml`, `config/SecurityConfig.java` — маршрут `/ws/**` добавлен и разрешен в SecurityConfig

### [x] 7. Маршрут уведомлений в Gateway routing
**Файл:** `application.yml` — маршрут `/api/v1/notifications/**` добавлен

---

## 🟡 КАЧЕСТВО (Sprint 2)

### [x] 8. Добавить `X-User-Roles` в SecurityConfig whitelist и strip заголовков
**Файл:** `filters/OpaqueTokenGlobalFilter.java` — принудительный strip входящих X-User-Id, X-User-Roles, X-Tenant-Id

### [x] 9. Health Aggregation endpoint
**Файл:** `controllers/HealthAggregationController.java` — GET /actuator/health/services опрашивает все 8 сервисовbackend/notification/` (см. TODO notification-service).

---

## 🟡 КАЧЕСТВО (Sprint 2)

### [ ] 8. Добавить `X-User-Roles` в SecurityConfig whitelist
**Файл:** `config/SecurityConfig.java`

Downstream-сервисы доверяют `X-User-Roles`. Убедиться, что клиент не может инжектировать этот header.
В Gateway — strip incoming `X-User-Id`, `X-User-Roles`, `X-Tenant-Id` перед обработкой,
затем добавлять из Redis-сессии. Так нельзя подделать роли.

```java
// В OpaqueTokenGlobalFilter — до мутации запроса:
ServerHttpRequest stripped = request.mutate()
    .headers(h -> { h.remove("X-User-Id"); h.remove("X-User-Roles"); h.remove("X-Tenant-Id"); })
    .build();
```

### [ ] 9. Health Aggregation endpoint
**Файл:** `controllers/HealthAggregationController.java` (СОЗДАТЬ)

`GET /actuator/health/services` — опрашивает `/actuator/health` всех 8 микросервисов параллельно (WebClient),
возвращает агрегированный JSON с UP/DOWN статусом каждого.

### [ ] 10. Integration tests с Testcontainers
**Файл:** `src/test/java/.../RoutingIntegrationTest.java` — расширить

Сейчас тест не поднимает реальный Redis — добавить:
```java
@Container
static GenericContainer<?> redis = new GenericContainer<>("redis:7.2-alpine").withExposedPorts(6379);
```
И тест на `OpaqueTokenGlobalFilter` с реальным Redis lookup.

---

## 📦 Зависимости для добавления в `build.gradle`
```groovy
implementation 'org.redisson:redisson-spring-boot-starter:3.32.0'
implementation 'io.github.resilience4j:resilience4j-spring-boot3:2.2.0'
testImplementation 'org.testcontainers:redis:1.19.8'
```
