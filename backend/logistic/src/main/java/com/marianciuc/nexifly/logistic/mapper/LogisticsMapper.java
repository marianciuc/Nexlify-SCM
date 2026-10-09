package com.marianciuc.nexifly.logistic.mapper;

import com.marianciuc.nexifly.logistic.domain.dto.DeliveryStopResponse;
import com.marianciuc.nexifly.logistic.domain.dto.DriverResponse;
import com.marianciuc.nexifly.logistic.domain.dto.RouteSheetResponse;
import com.marianciuc.nexifly.logistic.domain.dto.VehicleResponse;
import com.marianciuc.nexifly.logistic.domain.entity.DeliveryStopEn;
import com.marianciuc.nexifly.logistic.domain.entity.DriverEn;
import com.marianciuc.nexifly.logistic.domain.entity.RouteSheetEn;
import com.marianciuc.nexifly.logistic.domain.entity.VehicleEn;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(
        componentModel = MappingConstants.ComponentModel.SPRING,
        builder = @Builder(disableBuilder = true)
)
public interface LogisticsMapper {

    @Mapping(target = "carrierId", source = "carrier.id")
    VehicleResponse toVehicleResponse(VehicleEn entity);

    List<VehicleResponse> toVehicleResponseList(List<VehicleEn> entities);

    @Mapping(target = "carrierId", source = "carrier.id")
    @Mapping(target = "isAvailable", source = "available")
    DriverResponse toDriverResponse(DriverEn entity);

    List<DriverResponse> toDriverResponseList(List<DriverEn> entities);

    DeliveryStopResponse toDeliveryStopResponse(DeliveryStopEn entity);

    List<DeliveryStopResponse> toDeliveryStopResponseList(List<DeliveryStopEn> entities);

    @Mapping(target = "vehicleId", source = "vehicle.id")
    @Mapping(target = "vehiclePlate", source = "vehicle.plateNumber")
    @Mapping(target = "driverId", source = "driver.id")
    @Mapping(target = "driverLicense", source = "driver.licenseNumber")
    @Mapping(target = "stops", source = "stops")
    RouteSheetResponse toRouteSheetResponse(RouteSheetEn entity);

    List<RouteSheetResponse> toRouteSheetResponseList(List<RouteSheetEn> entities);
}
