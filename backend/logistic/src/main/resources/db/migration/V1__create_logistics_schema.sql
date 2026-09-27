CREATE SCHEMA IF NOT EXISTS logistics;

CREATE TABLE logistics.carriers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(128) NOT NULL,
    carrier_type VARCHAR(32) NOT NULL,
    license_number VARCHAR(64),
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE logistics.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrier_id UUID NOT NULL REFERENCES logistics.carriers(id),
    plate_number VARCHAR(32) UNIQUE NOT NULL,
    vehicle_type VARCHAR(32) NOT NULL,
    max_weight_kg NUMERIC(10,2) NOT NULL,
    max_volume_m3 NUMERIC(10,2) NOT NULL,
    has_refrigeration BOOLEAN DEFAULT false,
    has_adr_cert BOOLEAN DEFAULT false,
    fuel_type VARCHAR(16) DEFAULT 'DIESEL',
    fuel_consumption_l_per_100km NUMERIC(5,2),
    current_location_lat NUMERIC(10,7),
    current_location_lon NUMERIC(10,7),
    status VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE logistics.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    carrier_id UUID NOT NULL REFERENCES logistics.carriers(id),
    license_number VARCHAR(64) NOT NULL,
    license_category VARCHAR(8) NOT NULL,
    adr_cert_number VARCHAR(64),
    adr_cert_expires DATE,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE logistics.route_sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_number VARCHAR(64) UNIQUE NOT NULL,
    vehicle_id UUID NOT NULL REFERENCES logistics.vehicles(id),
    driver_id UUID NOT NULL REFERENCES logistics.drivers(id),
    status VARCHAR(32) NOT NULL DEFAULT 'PLANNED',
    planned_departure TIMESTAMPTZ,
    actual_departure TIMESTAMPTZ,
    planned_arrival TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    total_distance_km NUMERIC(10,2),
    total_weight_kg NUMERIC(10,2),
    fuel_consumed_l NUMERIC(8,2),
    graphhopper_route_json JSONB,
    ecmr_number VARCHAR(64),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE logistics.delivery_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_sheet_id UUID NOT NULL REFERENCES logistics.route_sheets(id) ON DELETE CASCADE,
    order_id UUID NOT NULL,
    stop_sequence INT NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(128) NOT NULL,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    planned_arrival TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    planned_departure TIMESTAMPTZ,
    actual_departure TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    signature_name VARCHAR(128),
    proof_of_delivery_url TEXT,
    failure_reason TEXT
);

CREATE INDEX idx_vehicles_status ON logistics.vehicles(status);
CREATE INDEX idx_route_sheets_status ON logistics.route_sheets(status);
CREATE INDEX idx_stops_route ON logistics.delivery_stops(route_sheet_id, stop_sequence);
