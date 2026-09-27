package com.marianciuc.nexifly.users.controller.impl;

import com.marianciuc.nexifly.users.controller.UsersController;
import com.marianciuc.nexifly.users.domain.dto.response.UserResponse;
import com.marianciuc.nexifly.users.exception.UserNotFoundException;
import com.marianciuc.nexifly.users.mapper.EntityDtoMapper;
import com.marianciuc.nexifly.users.repository.UserRepository;
import com.marianciuc.nexifly.users.repository.entity.UserEn;
import com.marianciuc.nexifly.users.service.GdprService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class UsersControllerImpl implements UsersController {

    private final UserRepository userRepository;
    private final EntityDtoMapper mapper;
    private final GdprService gdprService;

    @Override
    public ResponseEntity<UserResponse> getUser(UUID id) {
        UserEn user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        return ResponseEntity.ok(mapper.toUserResponse(user));
    }

    @Override
    public ResponseEntity<Void> deleteUser(UUID id, String reason, String initiator) {
        gdprService.processDataDeletion(id, reason, initiator);
        return ResponseEntity.noContent().build();
    }
}
