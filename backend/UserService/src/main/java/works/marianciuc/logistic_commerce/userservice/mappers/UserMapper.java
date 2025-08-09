package works.marianciuc.logistic_commerce.userservice.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import works.marianciuc.logistic_commerce.userservice.domain.model.User;
import works.marianciuc.logistic_commerce.userservice.repositories.entity.UserEn;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper extends BaseMapper<UserEn, User> {}
