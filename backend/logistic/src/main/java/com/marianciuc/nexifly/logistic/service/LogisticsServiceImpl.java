package com.marianciuc.nexifly.logistic.service;

import com.marianciuc.nexifly.logistic.domain.dto.*;
import com.marianciuc.nexifly.logistic.domain.entity.DeliveryStopEn;
import com.marianciuc.nexifly.logistic.domain.entity.DriverEn;
import com.marianciuc.nexifly.logistic.domain.entity.RouteSheetEn;
import com.marianciuc.nexifly.logistic.domain.entity.VehicleEn;
import com.marianciuc.nexifly.logistic.kafka.LogisticsProducer;
import com.marianciuc.nexifly.logistic.kafka.events.RouteOptimizedEvent;
import com.marianciuc.nexifly.logistic.kafka.events.ShipmentDeliveredEvent;
import com.marianciuc.nexifly.logistic.kafka.events.ShipmentDispatchedEvent;
import com.marianciuc.nexifly.logistic.kafka.events.VehicleLocationEvent;
import com.marianciuc.nexifly.logistic.repository.DeliveryStopRepository;
import com.marianciuc.nexifly.logistic.repository.DriverRepository;
import com.marianciuc.nexifly.logistic.repository.RouteSheetRepository;
import com.marianciuc.nexifly.logistic.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class LogisticsServiceImpl implements LogisticsService {

    private final RouteSheetRepository routeSheetRepository;
    private final DeliveryStopRepository deliveryStopRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final GraphHopperRoutingService routingService;
    private final LogisticsProducer logisticsProducer;

    @Override
    @Transactional
    public RouteSheetResponse createRoute(CreateRouteRequest req) {
        VehicleEn vehicle = vehicleRepository.findById(req.vehicleId())
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + req.vehicleId()));
        DriverEn driver = driverRepository.findById(req.driverId())
                .orElseThrow(() -> new IllegalArgumentException("Driver not found: " + req.driverId()));

        String routeNumber = "ROUTE-2026-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        RouteSheetEn route = RouteSheetEn.builder()
                .routeNumber(routeNumber)
                .vehicle(vehicle)
                .driver(driver)
                .status("PLANNED")
                .plannedDeparture(Instant.now().plusSeconds(3600))
                .notes(req.notes())
                .ecmrNumber("ECMR-PL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();

        double totalDist = 0.0;
        double prevLat = 52.2297; // Warsaw DC fallback
        double prevLon = 21.0122;

        if (req.stops() != null) {
            int seq = 1;
            for (DeliveryStopRequest sr : req.stops()) {
                double stopLat = sr.latitude() != null ? sr.latitude().doubleValue() : 52.4064;
                double stopLon = sr.longitude() != null ? sr.longitude().doubleValue() : 16.9252;

                GraphHopperRoutingService.RouteCalculationResult leg =
                        routingService.calculateRoute(prevLat, prevLon, stopLat, stopLon, "truck");
                totalDist += leg.distanceKm();
                prevLat = stopLat;
                prevLon = stopLon;

                DeliveryStopEn stop = DeliveryStopEn.builder()
                        .orderId(sr.orderId())
                        .stopSequence(sr.stopSequence() != null ? sr.stopSequence() : seq++)
                        .address(sr.address() != null ? sr.address() : "Delivery address")
                        .city(sr.city() != null ? sr.city() : "Warszawa")
                        .latitude(BigDecimal.valueOf(stopLat))
                        .longitude(BigDecimal.valueOf(stopLon))
                        .plannedArrival(Instant.now().plusSeconds((long) (totalDist * 50)))
                        .status("PENDING")
                        .build();
                route.addStop(stop);
            }
        }

        BigDecimal distanceKm = BigDecimal.valueOf(totalDist).setScale(2, RoundingMode.HALF_UP);
        BigDecimal consumption = vehicle.getFuelConsumptionLPer100km() != null ? vehicle.getFuelConsumptionLPer100km() : BigDecimal.valueOf(28.5);
        BigDecimal fuelConsumed = distanceKm.multiply(consumption).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        route.setTotalDistanceKm(distanceKm);
        route.setFuelConsumedL(fuelConsumed);

        route = routeSheetRepository.save(route);
        log.info("Created RouteSheet: {} with totalDistance={} km", routeNumber, distanceKm);

        List<UUID> orderIds = route.getStops().stream().map(DeliveryStopEn::getOrderId).toList();
        logisticsProducer.publishRouteOptimized(RouteOptimizedEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType("ROUTE_OPTIMIZED")
                .routeSheetId(route.getId())
                .routeNumber(route.getRouteNumber())
                .vehicleId(vehicle.getId())
                .driverId(driver.getId())
                .totalDistanceKm(distanceKm)
                .orderIds(orderIds)
                .timestamp(Instant.now())
                .build());

        return mapToResponse(route);
    }

    @Override
    @Transactional
    public RouteSheetResponse dispatchRoute(UUID routeSheetId) {
        RouteSheetEn route = routeSheetRepository.findById(routeSheetId)
                .orElseThrow(() -> new IllegalArgumentException("Route not found: " + routeSheetId));

        route.setStatus("DISPATCHED");
        route.setActualDeparture(Instant.now());

        if (route.getVehicle() != null) {
            route.getVehicle().setStatus("IN_TRANSIT");
            vehicleRepository.save(route.getVehicle());
        }

        route = routeSheetRepository.save(route);
        List<UUID> orderIds = route.getStops().stream().map(DeliveryStopEn::getOrderId).toList();

        logisticsProducer.publishShipmentDispatched(ShipmentDispatchedEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType("SHIPMENT_DISPATCHED")
                .routeSheetId(route.getId())
                .routeNumber(route.getRouteNumber())
                .orderIds(orderIds)
                .driverId(route.getDriver() != null ? route.getDriver().getId() : null)
                .plateNumber(route.getVehicle() != null ? route.getVehicle().getPlateNumber() : "UNKNOWN")
                .departureTime(route.getActualDeparture())
                .timestamp(Instant.now())
                .build());

        return mapToResponse(route);
    }

    @Override
    @Transactional
    public RouteSheetResponse confirmDelivery(UUID routeSheetId, UUID stopId, String signatureName, String proofUrl) {
        RouteSheetEn route = routeSheetRepository.findById(routeSheetId)
                .orElseThrow(() -> new IllegalArgumentException("Route not found: " + routeSheetId));

        DeliveryStopEn targetStop = null;
        for (DeliveryStopEn stop : route.getStops()) {
            if (stop.getId().equals(stopId)) {
                targetStop = stop;
                stop.setStatus("DELIVERED");
                stop.setActualArrival(Instant.now());
                stop.setSignatureName(signatureName != null ? signatureName : "Consignee Signature");
                stop.setProofOfDeliveryUrl(proofUrl);
                deliveryStopRepository.save(stop);
                break;
            }
        }

        if (targetStop != null) {
            logisticsProducer.publishShipmentDelivered(ShipmentDeliveredEvent.builder()
                    .eventId(UUID.randomUUID().toString())
                    .eventType("SHIPMENT_DELIVERED")
                    .routeSheetId(route.getId())
                    .orderId(targetStop.getOrderId())
                    .signatureName(targetStop.getSignatureName())
                    .deliveryTime(targetStop.getActualArrival())
                    .timestamp(Instant.now())
                    .build());
        }

        // Check if all stops delivered
        boolean allDelivered = route.getStops().stream().allMatch(s -> "DELIVERED".equalsIgnoreCase(s.getStatus()));
        if (allDelivered) {
            route.setStatus("COMPLETED");
            route.setActualArrival(Instant.now());
            if (route.getVehicle() != null) {
                route.getVehicle().setStatus("AVAILABLE");
                vehicleRepository.save(route.getVehicle());
            }
            route = routeSheetRepository.save(route);
        }

        return mapToResponse(route);
    }

    @Override
    @Transactional(readOnly = true)
    public RouteSheetResponse getRouteById(UUID id) {
        RouteSheetEn route = routeSheetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Route not found: " + id));
        return mapToResponse(route);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RouteSheetResponse> getAllRoutes(String status, Pageable pageable) {
        Page<RouteSheetEn> page = status != null && !status.isBlank()
                ? routeSheetRepository.findByStatus(status, pageable)
                : routeSheetRepository.findAll(pageable);
        return page.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public RouteSheetResponse getTrackingByOrderId(UUID orderId) {
        List<DeliveryStopEn> stops = deliveryStopRepository.findByOrderId(orderId);
        if (stops.isEmpty()) {
            throw new IllegalArgumentException("No shipment found for order: " + orderId);
        }
        return mapToResponse(stops.getFirst().getRouteSheet());
    }

    @Override
    @Transactional
    public void updateVehicleLocation(UUID vehicleId, UpdateLocationRequest req) {
        VehicleEn vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + vehicleId));

        vehicle.setCurrentLocationLat(req.latitude());
        vehicle.setCurrentLocationLon(req.longitude());
        vehicleRepository.save(vehicle);

        logisticsProducer.publishVehicleLocation(VehicleLocationEvent.builder()
                .vehicleId(vehicle.getId())
                .plateNumber(vehicle.getPlateNumber())
                .latitude(req.latitude())
                .longitude(req.longitude())
                .timestamp(Instant.now())
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleResponse> getFleet() {
        return vehicleRepository.findAll().stream().map(v -> VehicleResponse.builder()
                .id(v.getId())
                .carrierId(v.getCarrier() != null ? v.getCarrier().getId() : null)
                .plateNumber(v.getPlateNumber())
                .vehicleType(v.getVehicleType())
                .maxWeightKg(v.getMaxWeightKg())
                .maxVolumeM3(v.getMaxVolumeM3())
                .hasRefrigeration(v.getHasRefrigeration())
                .hasAdrCert(v.getHasAdrCert())
                .fuelType(v.getFuelType())
                .fuelConsumptionLPer100km(v.getFuelConsumptionLPer100km())
                .currentLocationLat(v.getCurrentLocationLat())
                .currentLocationLon(v.getCurrentLocationLon())
                .status(v.getStatus())
                .build()).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DriverResponse> getDrivers() {
        return driverRepository.findAll().stream().map(d -> DriverResponse.builder()
                .id(d.getId())
                .userId(d.getUserId())
                .carrierId(d.getCarrier() != null ? d.getCarrier().getId() : null)
                .licenseNumber(d.getLicenseNumber())
                .licenseCategory(d.getLicenseCategory())
                .adrCertNumber(d.getAdrCertNumber())
                .adrCertExpires(d.getAdrCertExpires())
                .isAvailable(d.isAvailable())
                .build()).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FuelReportResponse getFuelReport(String period) {
        List<RouteSheetEn> routes = routeSheetRepository.findAll();
        BigDecimal totalDist = BigDecimal.ZERO;
        BigDecimal totalFuel = BigDecimal.ZERO;

        for (RouteSheetEn r : routes) {
            if (r.getTotalDistanceKm() != null) totalDist = totalDist.add(r.getTotalDistanceKm());
            if (r.getFuelConsumedL() != null) totalFuel = totalFuel.add(r.getFuelConsumedL());
        }

        // CO2 factor: 2.64 kg CO2 per liter of diesel
        BigDecimal co2Emissions = totalFuel.multiply(BigDecimal.valueOf(2.64)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal avg100 = totalDist.compareTo(BigDecimal.ZERO) > 0
                ? totalFuel.multiply(BigDecimal.valueOf(100)).divide(totalDist, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal costPln = totalFuel.multiply(BigDecimal.valueOf(6.50)).setScale(2, RoundingMode.HALF_UP);

        return FuelReportResponse.builder()
                .period(period != null ? period : "2026-09")
                .totalDistanceKm(totalDist)
                .totalFuelConsumedL(totalFuel)
                .totalCO2EmittedKg(co2Emissions)
                .avgFuelPer100km(avg100)
                .estimatedCostPln(costPln)
                .build();
    }

    private RouteSheetResponse mapToResponse(RouteSheetEn entity) {
        List<DeliveryStopResponse> stops = entity.getStops() != null
                ? entity.getStops().stream().map(s -> DeliveryStopResponse.builder()
                .id(s.getId())
                .orderId(s.getOrderId())
                .stopSequence(s.getStopSequence())
                .address(s.getAddress())
                .city(s.getCity())
                .latitude(s.getLatitude())
                .longitude(s.getLongitude())
                .plannedArrival(s.getPlannedArrival())
                .actualArrival(s.getActualArrival())
                .plannedDeparture(s.getPlannedDeparture())
                .actualDeparture(s.getActualDeparture())
                .status(s.getStatus())
                .signatureName(s.getSignatureName())
                .proofOfDeliveryUrl(s.getProofOfDeliveryUrl())
                .build()).toList()
                : List.of();

        return RouteSheetResponse.builder()
                .id(entity.getId())
                .routeNumber(entity.getRouteNumber())
                .vehicleId(entity.getVehicle() != null ? entity.getVehicle().getId() : null)
                .vehiclePlate(entity.getVehicle() != null ? entity.getVehicle().getPlateNumber() : null)
                .driverId(entity.getDriver() != null ? entity.getDriver().getId() : null)
                .driverLicense(entity.getDriver() != null ? entity.getDriver().getLicenseNumber() : null)
                .status(entity.getStatus())
                .plannedDeparture(entity.getPlannedDeparture())
                .actualDeparture(entity.getActualDeparture())
                .plannedArrival(entity.getPlannedArrival())
                .actualArrival(entity.getActualArrival())
                .totalDistanceKm(entity.getTotalDistanceKm())
                .totalWeightKg(entity.getTotalWeightKg())
                .fuelConsumedL(entity.getFuelConsumedL())
                .ecmrNumber(entity.getEcmrNumber())
                .notes(entity.getNotes())
                .stops(stops)
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
