package com.marianciuc.nexifly.users.mapper;

import com.marianciuc.nexifly.users.domain.dto.response.CompanyResponse;
import com.marianciuc.nexifly.users.domain.dto.response.LocationResponse;
import com.marianciuc.nexifly.users.domain.dto.response.UserResponse;
import com.marianciuc.nexifly.users.repository.entity.CompanyEn;
import com.marianciuc.nexifly.users.repository.entity.CompanyLocationEn;
import com.marianciuc.nexifly.users.repository.entity.UserEn;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(
        componentModel = MappingConstants.ComponentModel.SPRING,
        builder = @Builder(disableBuilder = true)
)
public interface UserMapper {

    CompanyResponse toCompanyResponse(CompanyEn entity);

    List<CompanyResponse> toCompanyResponseList(List<CompanyEn> entities);

    @Mapping(target = "companyId", source = "company.id")
    LocationResponse toLocationResponse(CompanyLocationEn entity);

    List<LocationResponse> toLocationResponseList(List<CompanyLocationEn> entities);

    @Mapping(target = "companyId", source = "company.id")
    UserResponse toUserResponse(UserEn entity);

    List<UserResponse> toUserResponseList(List<UserEn> entities);
}
