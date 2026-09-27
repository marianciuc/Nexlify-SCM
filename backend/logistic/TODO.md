# TODO: Logistics Service — Full Implementation Required

## Текущее состояние
Каркас: 4 файла — application, security config, controller-mock, ShipmentDto. Полная имплементация отсутствует.

---

## 🔴 КРИТИЧНО — ФУНДАМЕНТ (Sprint 2)

### [x] 1. Gradle + application.yaml
Добавить: JPA, Flyway, Spring Kafka, WebClient (для GraphHopper), OpenFeign (для Inventory API).

### [x] 2. Flyway DDL — `logistics_db`
```sql
-- V1__create_logistics_schema.sql
CREATE SCHEMA IF NOT EXISTS logistics;

CREATE TABLE logistics.carriers (  -- транспортные компании
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,        -- ссылка на user_db.companies (только UUID)
    name VARCHAR(128) NOT NULL,
    carrier_type VARCHAR(32) NOT NULL, -- OWN_FLEET, CONTRACTED, SPOT_MARKET
    license_number VARCHAR(64),
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE logistics.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrier_id UUID NOT NULL REFERENCES logistics.carriers(id),
    plate_number VARCHAR(32) UNIQUE NOT NULL,
    vehicle_type VARCHAR(32) NOT NULL,  -- TRUCK_3_5T, TRUCK_12T, TRUCK_24T, VAN
    max_weight_kg NUMERIC(10,2) NOT NULL,
    max_volume_m3 NUMERIC(10,2) NOT NULL,
    has_refrigeration BOOLEAN DEFAULT false,
    has_adr_cert BOOLEAN DEFAULT false,  -- опасные грузы
    fuel_type VARCHAR(16) DEFAULT 'DIESEL',
    fuel_consumption_l_per_100km NUMERIC(5,2),
    current_location_lat NUMERIC(10,7),
    current_location_lon NUMERIC(10,7),
    status VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, IN_TRANSIT, MAINTENANCE
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE logistics.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,             -- ссылка на user_db.users (только UUID)
    carrier_id UUID NOT NULL REFERENCES logistics.carriers(id),
    license_number VARCHAR(64) NOT NULL,
    license_category VARCHAR(8) NOT NULL, -- B, C, CE, D
    adr_cert_number VARCHAR(64),
    adr_cert_expires DATE,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE logistics.route_sheets (  -- путевые листы / рейсы
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_number VARCHAR(64) UNIQUE NOT NULL,  -- ROUTE-2026-XXXXX
    vehicle_id UUID NOT NULL REFERENCES logistics.vehicles(id),
    driver_id UUID NOT NULL REFERENCES logistics.drivers(id),
    status VARCHAR(32) NOT NULL DEFAULT 'PLANNED', -- PLANNED, DISPATCHED, IN_TRANSIT, COMPLETED, CANCELLED
    planned_departure TIMESTAMPTZ,
    actual_departure TIMESTAMPTZ,
    planned_arrival TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    total_distance_km NUMERIC(10,2),
    total_weight_kg NUMERIC(10,2),
    fuel_consumed_l NUMERIC(8,2),
    graphhopper_route_json JSONB,  -- сохранить ответ GraphHopper для воспроизведения
    ecmr_number VARCHAR(64),       -- номер электронной CMR-накладной
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE logistics.delivery_stops (  -- остановки (заказы) в рейсе
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_sheet_id UUID NOT NULL REFERENCES logistics.route_sheets(id) ON DELETE CASCADE,
    order_id UUID NOT NULL,          -- ID заказа из order_db
    stop_sequence INT NOT NULL,      -- порядок остановки в маршруте
    address TEXT NOT NULL,
    city VARCHAR(128) NOT NULL,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    planned_arrival TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    planned_departure TIMESTAMPTZ,
    actual_departure TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- PENDING, ARRIVED, DELIVERED, FAILED
    signature_name VARCHAR(128),     -- кто принял груз
    proof_of_delivery_url TEXT,      -- фото накладной / подпись
    failure_reason TEXT              -- если FAILED
);

CREATE INDEX idx_vehicles_status ON logistics.vehicles(status);
CREATE INDEX idx_route_sheets_status ON logistics.route_sheets(status);
CREATE INDEX idx_stops_route ON logistics.delivery_stops(route_sheet_id, stop_sequence);
```

---

## 🔴 КРИТИЧНО — GRAPHHOPPER ИНТЕГРАЦИЯ (Sprint 2)

### [x] 3. GraphHopperRoutingService
**Файл:** `service/GraphHopperRoutingService.java` (СОЗДАТЬ)

Это главная особенность сервиса. GraphHopper 9.x запускается как отдельный процесс (jar) с OSM-данными Польши.

```java
@Service
public class GraphHopperRoutingService {

    private final WebClient graphHopperClient;  // http://localhost:8989

    // 1. Матрица расстояний (для VRP pre-processing)
    public DistanceMatrix calculateDistanceMatrix(List<LatLon> locations) {
        // POST http://localhost:8989/route
        // body: {"points": [[lon, lat], ...], "vehicle": "car", "calc_points": false}
        // → матрица distance[i][j] и time[i][j]
    }

    // 2. VRP оптимизация маршрута (с использованием jsprit через GraphHopper)
    public OptimizedRoute optimizeRoute(VrpProblem problem) {
        // Использовать GraphHopper Routing API + jsprit VRP solver
        // VrpProblem: {vehicles, jobs, fleet constraints}
        // Ограничения CVRPTW:
        //   - Capacity: вес и объём не превышает max_weight_kg, max_volume_m3
        //   - Time windows: delivery_stops должны прибыть в timeWindow
        //   - Driver hours: не более 8 часов вождения (EU Tachograph rules)
        // Вернуть: {vehicleId, stops: [{orderId, sequence, eta}], totalDistanceKm}
    }

    // 3. Простой маршрут A→B
    public RouteDetails getRoute(LatLon from, LatLon to) {
        // GET http://localhost:8989/route?point={lat},{lon}&point={lat},{lon}&vehicle=car
        // → distance, time, polyline
    }
}
```

**GraphHopper Setup:**
Создать `scripts/setup-graphhopper.sh`:
```bash
# Скачать польский OSM
wget https://download.geofabrik.de/europe/poland-latest.osm.pbf
# Запустить GraphHopper с OSM-графом
java -jar graphhopper-web-9.x.jar server config.yaml
```

### [x] 4. VRP Dispatcher — Kafka Consumer (PaymentSucceeded)
**Файл:** `kafka/consumer/PaymentEventConsumer.java` (СОЗДАТЬ)

```java
@KafkaListener(topics = "payment-events")
public void onPaymentSucceeded(PaymentSucceededEvent event) {
    // 1. Найти все pending заказы того же поставщика/склада
    // 2. Попробовать объединить в один рейс (batch-dispatching)
    // 3. Если vehicle доступен — запустить VRP оптимизацию
    // 4. Создать route_sheet + delivery_stops
    // 5. Publish RouteOptimizedEvent → Order Service переводит в SHIPPED
}
```

### [x] 5. Tracking — GPS обновление координат ТС
**Файл:** `controller/TrackingController.java` (СОЗДАТЬ)

```
POST /api/v1/logistics/vehicles/{id}/location
  body: {lat, lon, timestamp, speedKmh, fuelLevelPercent}
  → обновить current_location в vehicles
  → Publish VehicleLocationEvent → Notification Service отправит в WebSocket

GET /api/v1/logistics/shipments/{orderId}/tracking
  → текущее положение ТС, следующая остановка, ETA
```

---

## 🟠 ВАЖНО (Sprint 2)

### [ ] 6. e-CMR (Электронная Транспортная Накладная)
**Файл:** `service/EcmrService.java` (СОЗДАТЬ)

Директива ЕС о е-CMR (электронная CMR-накладная). Обязательна для международных грузоперевозок.

```
POST /api/v1/logistics/ecmr
  body: {routeSheetId, consignorCompanyId, consigneeCompanyId, goodsDescription}
  → Сгенерировать e-CMR PDF
  → Зарегистрировать в ecmr_number (уникальный номер)
  → Publish EcmrGeneratedEvent → Notification Service

POST /api/v1/logistics/ecmr/{id}/sign
  body: {signerRole: DRIVER|CONSIGNEE|CARRIER, signatureBase64}
  → Сохранить электронную подпись
  → После 3 подписей → статус FINALIZED
```

Библиотека для PDF: `iText 7` или `OpenPDF`.

### [x] 7. Fuel & CO₂ Reporting (ESG)
**Файл:** `service/FuelConsumptionReportService.java` (СОЗДАТЬ)

```
GET /api/v1/logistics/reports/fuel?period=2026-09&carrierId={id}
→ {totalFuelConsumedL, totalCO2EmittedKg, avgFuelPer100km, costPLN}

CO₂ расчёт: fuel_consumed_L × 2.64 kg/L (diesel emission factor)
```

### [x] 8. REST API — полный контракт
```
GET    /api/v1/logistics/shipments            → Page<ShipmentResponse> (фильтры: status, orderId, driverId)
GET    /api/v1/logistics/shipments/{orderId}  → детальный трекинг
GET    /api/v1/logistics/routes               → реестр путевых листов
GET    /api/v1/logistics/routes/{id}          → детали маршрута
POST   /api/v1/logistics/routes               → создать рейс вручную
POST   /api/v1/logistics/routes/optimize      → VRP-оптимизация (вернуть предложение, не создавать)
PATCH  /api/v1/logistics/routes/{id}/dispatch → PLANNED → DISPATCHED
PATCH  /api/v1/logistics/routes/{id}/stops/{stopId}/deliver → подтвердить доставку на остановке
GET    /api/v1/logistics/fleet                → реестр ТС + текущее положение
GET    /api/v1/logistics/drivers              → реестр водителей
POST   /api/v1/logistics/drivers              → добавить водителя
```

---

## 📁 Файлы для создания
```
backend/logistic/src/main/java/.../logistic/
├── config/{KafkaConfig, GraphHopperConfig, SecurityConfig}.java
├── domain/entity/{CarrierEn, VehicleEn, DriverEn, RouteSheetEn, DeliveryStopEn}.java
├── domain/dto/{request,response}/...
├── kafka/consumer/{PaymentEventConsumer, OrderEventConsumer}.java
├── kafka/events/{RouteOptimizedEvent, ShipmentDispatchedEvent, ShipmentDeliveredEvent}.java
├── service/{GraphHopperRoutingService, VrpDispatchService, EcmrService, TrackingService, FuelReportService}.java
├── controller/{ShipmentController, RouteController, FleetController, TrackingController, EcmrController}.java
└── scheduler/RouteOptimizationScheduler.java  ← периодическая батч-диспетчеризация

src/main/resources/
├── db/migration/V1-V3__*.sql
└── application.yaml  ← добавить graphhopper.base-url, graphhopper.osm-file
```
