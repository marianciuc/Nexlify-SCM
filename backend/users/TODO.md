# TODO: User Service — Gaps & Missing Implementation

## Текущее состояние
Сервис наиболее проработан: контроллеры, entities, repositories, services, exception-handler, mapper.
Но критически не хватает: Flyway-миграций, реализации OpaqueTokenService, VIES-валидации, Kafka-продюсера и ряда бизнес-правил.

---

## 🔴 КРИТИЧНО (Блокирует запуск в проде)

### [x] 1. Flyway-миграции
**Директория:** `src/main/resources/db/migration/` (РЕАЛИЗОВАНО)
- `V1__create_user_db_schema.sql`
- `V2__create_companies.sql`
- `V3__create_company_bank_details.sql`
- `V4__create_company_locations.sql`
- `V5__create_users.sql`
- `V6__create_gdpr_logs.sql`
- `V7__create_authentication_logs.sql`
- `V8__create_credit_limits.sql`
- `ddl-auto: validate` и схема `user_db` настроены в `application.yaml`

### [x] 2. OpaqueTokenService — реализация
**Файл:** `service/OpaqueTokenService.java` (РЕАЛИЗОВАНО)
- RedissonClient + StringRedisTemplate
- Хранение `SessionData` и `RefreshData` в виде JSON под `opaque:access:` и `opaque:refresh:`
- TTL: 15 минут для access, 24 часа для refresh
- Revoke и refresh логика с удалением старых сессий

### [x] 3. AuthService — реализация SSO exchangeCode и Direct Grants
**Файл:** `service/AuthService.java` (РЕАЛИЗОВАНО)
- Keycloak code exchange и direct password grant
- Автоматический маппинг ролей, создание локальных профилей, генерация Opaque пары

### [x] 4. KeycloakRestClient — реализация Admin и Auth методов
**Файл:** `client/keycloak/KeycloakRestClient.java` (РЕАЛИЗОВАНО)
- `getTokenByPassword`, `getTokenByCode`, `refreshToken`, `createUser`, `assignRealmRole`, `getAdminAccessToken`

Нужно добавить методы Admin REST API (для `UserService` — не только auth flows):
```java
// getUserById(String keycloakId)
// createUser(CreateUserRequest) → String keycloakId
// setUserPassword(String keycloakId, String password, boolean temporary)
// assignRealmRole(String keycloakId, String roleName)
// deleteUser(String keycloakId)
// getUserRoles(String keycloakId) → List<String>
// getTokenByPassword(String username, String password) → KeycloakTokenResponse
// getTokenByCode(String code, String redirectUri) → KeycloakTokenResponse
// refreshToken(String refreshToken) → KeycloakTokenResponse
```
Использует `WebClient` (reactive) с `client_credentials` grant к Admin REST API.

---

## 🟠 ВАЖНО — БИЗНЕС-ЛОГИКА (Sprint 1)

### [x] 5. VIES-валидация NIP/VAT при онбординге
**Файл:** `service/ViesValidationService.java` (РЕАЛИЗОВАНО)
- Алгоритм контрольной суммы польского NIP (веса [6, 5, 7, 2, 3, 4, 5, 6, 7])
- Кэширование валидации в Redis на 24 часа

### [x] 6. Kafka Producer — события из UserService
**Файл:** `kafka/UserEventProducer.java`, `config/KafkaTopicConfig.java` (РЕАЛИЗОВАНО)
- Топик `user-events` (3 партиции)
- События: `CompanyVerifiedEvent`, `CompanyBlockedEvent`, `UserRegisteredEvent`, `UserDeletedEvent`
- Интегрировано в `CompanyVerificationServiceImpl`

### [x] 7. Company Credit Limit API
**Файл:** `controller/CreditLimitsController.java`, `repository/entity/CompanyCreditLimitEn.java` (РЕАЛИЗОВАНО)
- `GET /api/v1/companies/{id}/credit-limit`
- `POST /api/v1/companies/{id}/credit-limit`
- `GET /api/v1/companies/{id}/credit-limit/check?amount=...`
- Таблица `user_db.credit_limits` в Flyway V8

---

## 🟡 КАЧЕСТВО (Sprint 2)

### [x] 9. Spring Security конфигурация
**Файл:** `config/SecurityConfig.java`, `security/GatewayAuthenticationFilter.java` (РЕАЛИЗОВАНО)
- Stateless session management
- Извлечение X-User-Id и X-User-Roles из заголовков Gateway
- Открытые auth / swagger / actuator endpoints, защищенные бизнес-эндпоинты

### [ ] 10. Pagination на getCompanies / getEmployees
**Файл:** `controller/CompaniesController.java`

`GET /api/v1/companies` возвращает `List<CompanyResponse>` — при 1000+ компаний это OOM.
Заменить на `Page<CompanyResponse>` + параметры `page`, `size`, `sort`.
Репозиторий: `CompanyRepository extends JpaRepository` → добавить `findAllByVerificationStatus(Pageable)`.

### [ ] 11. Unit-тесты — минимум 80% coverage
**Директория:** `src/test/java/.../`

Приоритет написания:
1. `OpaqueTokenServiceImplTest` — MockRedisson, проверить TTL, пустой lookup
2. `CompanyVerificationServiceImplTest` — переходы статусов, запрет перехода VERIFIED→PENDING
3. `AuthServiceImplTest` — mock KeycloakRestClient, проверить что keycloakJwt не утекает в response
4. `GdprServiceImplTest` — удаление user anonymizes fields, не удаляет компанию

### [ ] 12. application.yaml — добавить недостающие Keycloak настройки
```yaml
keycloak:
  auth-server-url: ${KEYCLOAK_URL:http://localhost:9090}
  realm: ${KEYCLOAK_REALM:nexlify}
  client-id: ${KEYCLOAK_CLIENT_ID:application-client}
  client-secret: ${KEYCLOAK_CLIENT_SECRET:changeme}
  admin-client-id: ${KEYCLOAK_ADMIN_CLIENT_ID:admin-cli}
  admin-username: ${KEYCLOAK_ADMIN_USERNAME:admin}
  admin-password: ${KEYCLOAK_ADMIN_PASSWORD:admin}

spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
```

---

## 📁 Файлы для создания (структура)
```
src/main/java/.../users/
├── config/
│   ├── RedissonConfig.java          ← СОЗДАТЬ
│   ├── KafkaProducerConfig.java     ← СОЗДАТЬ
│   └── SecurityConfig.java          ← проверить/создать
├── filter/
│   └── GatewayAuthenticationFilter.java  ← СОЗДАТЬ
├── service/
│   ├── ViesValidationService.java   ← СОЗДАТЬ
│   ├── AuthService.java             ← ЗАПОЛНИТЬ
│   └── impl/
│       ├── AuthServiceImpl.java     ← СОЗДАТЬ
│       └── OpaqueTokenServiceImpl.java  ← СОЗДАТЬ
├── kafka/
│   ├── UserEventProducer.java       ← СОЗДАТЬ
│   └── events/
│       ├── CompanyVerifiedEvent.java    ← СОЗДАТЬ (record)
│       ├── CompanyBlockedEvent.java     ← СОЗДАТЬ (record)
│       └── UserRegisteredEvent.java     ← СОЗДАТЬ (record)
└── repository/entity/
    └── CompanyCreditLimitEn.java    ← СОЗДАТЬ

src/main/resources/
├── db/migration/
│   ├── V1__create_schema.sql
│   ├── V2__create_companies.sql
│   ├── V3__create_bank_details.sql
│   ├── V4__create_locations.sql
│   ├── V5__create_users.sql
│   ├── V6__create_gdpr_logs.sql
│   ├── V7__create_auth_logs.sql
│   └── V8__create_credit_limits.sql
└── application.yaml ← дополнить Keycloak + Flyway
```
