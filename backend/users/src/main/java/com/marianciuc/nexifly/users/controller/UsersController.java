package com.marianciuc.nexifly.users.controller;

import com.marianciuc.nexifly.users.domain.dto.response.UserResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RequestMapping("/api/v1/users")
public interface UsersController {

    @GetMapping("/{id}")
    ResponseEntity<UserResponse> getUser(@PathVariable UUID id);

    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteUser(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "GDPR user deletion request") String reason,
            @RequestParam(defaultValue = "SELF") String initiator);
}
