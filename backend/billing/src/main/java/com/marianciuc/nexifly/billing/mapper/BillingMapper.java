package com.marianciuc.nexifly.billing.mapper;

import com.marianciuc.nexifly.billing.domain.dto.CreditNoteResponse;
import com.marianciuc.nexifly.billing.domain.dto.InvoiceDetailResponse;
import com.marianciuc.nexifly.billing.domain.dto.InvoiceLineResponse;
import com.marianciuc.nexifly.billing.domain.entity.CreditNoteEn;
import com.marianciuc.nexifly.billing.domain.entity.InvoiceEn;
import com.marianciuc.nexifly.billing.domain.entity.InvoiceLineEn;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(
        componentModel = MappingConstants.ComponentModel.SPRING,
        builder = @Builder(disableBuilder = true)
)
public interface BillingMapper {

    InvoiceDetailResponse toDetailResponse(InvoiceEn entity);

    List<InvoiceDetailResponse> toDetailResponseList(List<InvoiceEn> entities);

    InvoiceLineResponse toLineResponse(InvoiceLineEn entity);

    List<InvoiceLineResponse> toLineResponseList(List<InvoiceLineEn> entities);

    @Mapping(target = "originalInvoiceId", source = "originalInvoice.id")
    CreditNoteResponse toCreditResponse(CreditNoteEn entity);

    List<CreditNoteResponse> toCreditResponseList(List<CreditNoteEn> entities);
}
