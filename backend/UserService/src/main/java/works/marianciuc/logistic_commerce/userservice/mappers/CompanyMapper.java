package works.marianciuc.logistic_commerce.userservice.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import works.marianciuc.logistic_commerce.userservice.domain.dto.CompanyDto;
import works.marianciuc.logistic_commerce.userservice.domain.dto.CompanyListObject;
import works.marianciuc.logistic_commerce.userservice.domain.entity.Company;

@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    uses = {AddressMapper.class})
public interface CompanyMapper extends BaseMapper<Company, CompanyDto> {

  @Mapping(target = "address", expression = "java(company.getFullAddress())")
  CompanyListObject toCompanyListObject(Company company);
}
