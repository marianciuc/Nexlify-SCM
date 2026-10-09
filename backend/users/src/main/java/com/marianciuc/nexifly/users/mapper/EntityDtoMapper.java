package com.marianciuc.nexifly.users.mapper;

import com.marianciuc.nexifly.users.domain.dto.response.CompanyResponse;
import com.marianciuc.nexifly.users.domain.dto.response.LocationResponse;
import com.marianciuc.nexifly.users.domain.dto.response.UserResponse;
import com.marianciuc.nexifly.users.repository.entity.CompanyEn;
import com.marianciuc.nexifly.users.repository.entity.CompanyLocationEn;
import com.marianciuc.nexifly.users.repository.entity.UserEn;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EntityDtoMapper {

    private final UserMapper userMapper;

    public CompanyResponse toCompanyResponse(CompanyEn entity) {
        return userMapper.toCompanyResponse(entity);
    }

    public LocationResponse toLocationResponse(CompanyLocationEn entity) {
        return userMapper.toLocationResponse(entity);
    }

    public UserResponse toUserResponse(UserEn entity) {
        return userMapper.toUserResponse(entity);
    }
}
