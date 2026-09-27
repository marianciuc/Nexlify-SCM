package com.marianciuc.nexifly.logistic.service;

import com.marianciuc.nexifly.logistic.domain.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface LogisticsService {
    RouteSheetResponse createRoute(CreateRouteRequest request);
    RouteSheetResponse dispatchRoute(UUID routeSheetId);
    RouteSheetResponse confirmDelivery(UUID routeSheetId, UUID stopId, String signatureName, String proofUrl);
    RouteSheetResponse getRouteById(UUID id);
    Page<RouteSheetResponse> getAllRoutes(String status, Pageable pageable);
    RouteSheetResponse getTrackingByOrderId(UUID orderId);
    void updateVehicleLocation(UUID vehicleId, UpdateLocationRequest request);
    List<VehicleResponse> getFleet();
    List<DriverResponse> getDrivers();
    FuelReportResponse getFuelReport(String period);
}
