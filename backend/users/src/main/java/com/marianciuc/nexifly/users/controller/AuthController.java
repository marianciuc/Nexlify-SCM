package com.marianciuc.nexifly.users.controller;

import com.marianciuc.nexifly.users.domain.dto.request.LoginRequest;
import com.marianciuc.nexifly.users.domain.dto.request.RefreshTokenRequest;
import com.marianciuc.nexifly.users.domain.dto.request.RegisterRequest;
import com.marianciuc.nexifly.users.domain.dto.response.AuthResponse;
import com.marianciuc.nexifly.users.domain.dto.response.UserProfileResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/v1/auth")
public interface AuthController {

    @PostMapping("/login")
    ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request);

    @PostMapping("/refresh")
    ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request);

    @PostMapping("/logout")
    ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String authHeader);

    @GetMapping("/me")
    ResponseEntity<UserProfileResponse> getMe(@RequestHeader(value = "Authorization", required = false) String authHeader);

    @PostMapping("/register")
    ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request);

    @PostMapping("/exchange-code")
    ResponseEntity<AuthResponse> exchangeCode(@Valid @RequestBody com.marianciuc.nexifly.users.domain.dto.request.ExchangeCodeRequest request);
}
