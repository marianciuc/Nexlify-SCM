# Nexlify-SCM

Backend microservices for logistic-commerce identity and company management.

## Repository layout

- `backend/UserService` — Spring Boot service with auth, registration, company APIs, Flyway, Keycloak admin integration.
- `backend/Gateway` — Spring Cloud Gateway service.
- `Configuration/compose.yml` — local infrastructure stack (Consul, Redis, PostgreSQL, Keycloak).
- `http/get-token.http` — sample token request for the local Keycloak realm.

## Requirements

- Java 21 (`backend/*/pom.xml`)
- Maven 3.9+
- Docker + Docker Compose

## Local infrastructure

Start required services:

```bash
docker compose -f /home/runner/work/Nexlify-SCM/Nexlify-SCM/Configuration/compose.yml up -d
```

This starts:

- Consul: `localhost:8500`
- Redis: `localhost:6379`
- PostgreSQL: `localhost:5432`
- Keycloak: `localhost:9090`

## Run services

### UserService

```bash
cd /home/runner/work/Nexlify-SCM/Nexlify-SCM/backend/UserService
mvn spring-boot:run
```

`application.yml` imports config from Consul (`spring.config.import=consul:`), so Consul must be running.

### Gateway

```bash
cd /home/runner/work/Nexlify-SCM/Nexlify-SCM/backend/Gateway
mvn spring-boot:run
```

## Developer checks

Run tests before pushing:

```bash
cd /home/runner/work/Nexlify-SCM/Nexlify-SCM/backend/UserService
mvn test

cd /home/runner/work/Nexlify-SCM/Nexlify-SCM/backend/Gateway
mvn test
```

## Authentication quick check

Use `http/get-token.http` to request a token from realm `LogisticCommerce` at Keycloak (`localhost:9090`).

## Collaboration and delivery

- CI workflow: `.github/workflows/ci.yml`
- Release workflow: `.github/workflows/release.yml` (runs on `v*` tags)
- PR template: `.github/pull_request_template.md`
- Issue templates: `.github/ISSUE_TEMPLATE/`
- Governance/runbook: `docs/PROJECT_GOVERNANCE.md`
- Wiki starter: `docs/wiki/Home.md`
