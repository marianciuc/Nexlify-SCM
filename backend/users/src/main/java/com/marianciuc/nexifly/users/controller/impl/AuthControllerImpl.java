package com.marianciuc.nexifly.users.controller.impl;

import com.marianciuc.nexifly.users.controller.AuthController;
import com.marianciuc.nexifly.users.domain.dto.request.LoginRequest;
import com.marianciuc.nexifly.users.domain.dto.request.RefreshTokenRequest;
import com.marianciuc.nexifly.users.domain.dto.request.RegisterRequest;
import com.marianciuc.nexifly.users.domain.dto.response.AuthResponse;
import com.marianciuc.nexifly.users.domain.dto.response.UserProfileResponse;
import com.marianciuc.nexifly.users.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
public class AuthControllerImpl implements AuthController {

    private final AuthService authService;

    @Override
    public ResponseEntity<AuthResponse> login(LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Override
    public ResponseEntity<AuthResponse> refresh(RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @Override
    public ResponseEntity<Void> logout(String authHeader) {
        authService.logout(authHeader);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<UserProfileResponse> getMe(String authHeader) {
        return ResponseEntity.ok(authService.getMe(authHeader));
    }

    @Override
    public ResponseEntity<AuthResponse> register(RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @Override
    public ResponseEntity<AuthResponse> exchangeCode(com.marianciuc.nexifly.users.domain.dto.request.ExchangeCodeRequest request) {
        return ResponseEntity.ok(authService.exchangeAuthorizationCode(request));
    }
}
