package com.marianciuc.nexifly.notification.mapper;

import com.marianciuc.nexifly.notification.domain.dto.NotificationResponse;
import com.marianciuc.nexifly.notification.domain.dto.UserNotificationSettingsDto;
import com.marianciuc.nexifly.notification.domain.entity.NotificationEn;
import com.marianciuc.nexifly.notification.domain.entity.UserNotificationSettingsEn;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(
        componentModel = MappingConstants.ComponentModel.SPRING,
        builder = @Builder(disableBuilder = true)
)
public interface NotificationMapper {

    NotificationResponse toResponse(NotificationEn entity);

    List<NotificationResponse> toResponseList(List<NotificationEn> entities);

    UserNotificationSettingsDto toSettingsDto(UserNotificationSettingsEn entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(UserNotificationSettingsDto dto, @MappingTarget UserNotificationSettingsEn entity);
}
