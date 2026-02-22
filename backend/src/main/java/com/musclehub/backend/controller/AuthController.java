package com.musclehub.backend.controller;

import com.musclehub.backend.dto.AuthResponse;
import com.musclehub.backend.dto.LoginRequest;
import com.musclehub.backend.dto.RegisterRequest;
import com.musclehub.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        System.out.println("Login attempt for: " + request.getUsername());
        // Simple normalization to ensure case-insensitivity if desired, or just logging
        return ResponseEntity.ok(authService.login(request));
    }
}
