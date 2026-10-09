package com.marianciuc.nexifly.orders.mapper;

import com.marianciuc.nexifly.orders.domain.dto.OrderResponse;
import com.marianciuc.nexifly.orders.domain.entity.OrderEn;
import com.marianciuc.nexifly.orders.domain.entity.OrderItemEn;
import com.marianciuc.nexifly.orders.domain.entity.OrderStatusHistoryEn;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(
        componentModel = MappingConstants.ComponentModel.SPRING,
        builder = @Builder(disableBuilder = true)
)
public interface OrderMapper {

    @Mapping(target = "currency", source = "currency.code")
    OrderResponse toResponse(OrderEn order);

    OrderResponse.OrderItemResponse toItemResponse(OrderItemEn item);

    List<OrderResponse.OrderItemResponse> toItemResponseList(List<OrderItemEn> items);

    OrderResponse.StatusHistoryResponse toStatusHistoryResponse(OrderStatusHistoryEn history);

    List<OrderResponse.StatusHistoryResponse> toStatusHistoryResponseList(List<OrderStatusHistoryEn> history);
}
