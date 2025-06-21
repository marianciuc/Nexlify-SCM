package works.marianciuc.logistic_commerce.userservice.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import works.marianciuc.logistic_commerce.userservice.domain.dto.AddressDto;
import works.marianciuc.logistic_commerce.userservice.domain.entity.Address;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AddressMapper extends BaseMapper<Address, AddressDto> {}
