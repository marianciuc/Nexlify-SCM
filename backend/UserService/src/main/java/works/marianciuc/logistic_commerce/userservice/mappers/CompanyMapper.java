package works.marianciuc.logistic_commerce.userservice.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import works.marianciuc.logistic_commerce.userservice.domain.dto.CompanyListObject;
import works.marianciuc.logistic_commerce.userservice.domain.model.Company;
import works.marianciuc.logistic_commerce.userservice.repositories.entity.CompanyEn;

@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    uses = {AddressMapper.class})
public interface CompanyMapper extends BaseMapper<CompanyEn, Company> {

  @Mapping(target = "address", expression = "java(company.getAddress().getFullAddress())")
  CompanyListObject toCompanyListObject(CompanyEn company);
}
