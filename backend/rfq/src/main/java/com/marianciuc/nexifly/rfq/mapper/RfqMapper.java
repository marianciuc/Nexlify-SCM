package com.marianciuc.nexifly.rfq.mapper;

import com.marianciuc.nexifly.rfq.domain.dto.BidItemResponse;
import com.marianciuc.nexifly.rfq.domain.dto.BidResponse;
import com.marianciuc.nexifly.rfq.domain.dto.RfqItemResponse;
import com.marianciuc.nexifly.rfq.domain.dto.RfqResponse;
import com.marianciuc.nexifly.rfq.domain.entity.BidEn;
import com.marianciuc.nexifly.rfq.domain.entity.BidItemEn;
import com.marianciuc.nexifly.rfq.domain.entity.RfqItemEn;
import com.marianciuc.nexifly.rfq.domain.entity.RfqRequestEn;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(
        componentModel = MappingConstants.ComponentModel.SPRING,
        builder = @Builder(disableBuilder = true)
)
public interface RfqMapper {

    RfqItemResponse toItemResponse(RfqItemEn entity);

    List<RfqItemResponse> toItemResponseList(List<RfqItemEn> entities);

    BidItemResponse toBidItemResponse(BidItemEn entity);

    List<BidItemResponse> toBidItemResponseList(List<BidItemEn> entities);

    @Mapping(target = "rfqId", source = "rfq.id")
    @Mapping(target = "items", source = "items")
    BidResponse toBidResponse(BidEn entity);

    List<BidResponse> toBidResponseList(List<BidEn> entities);

    @Mapping(target = "bidsCount", expression = "java(entity.getBids() != null ? entity.getBids().size() : 0)")
    @Mapping(target = "items", source = "items")
    @Mapping(target = "bids", source = "bids")
    RfqResponse toResponse(RfqRequestEn entity);

    List<RfqResponse> toResponseList(List<RfqRequestEn> entities);
}
