package com.labourconnect.controller;

import com.labourconnect.dto.*;
import com.labourconnect.security.UserPrincipal;
import com.labourconnect.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final com.labourconnect.service.GoogleAuthService googleAuthService;

    public AuthController(AuthService authService, com.labourconnect.service.GoogleAuthService googleAuthService) {
        this.authService = authService;
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<GoogleAuthResponse>> authenticateGoogle(@Valid @RequestBody GoogleAuthRequest request) {
        GoogleAuthResponse response = googleAuthService.authenticateGoogle(request);
        return ResponseEntity.ok(ApiResponse.ok(response.getMessage() != null ? response.getMessage() : "Google authentication processed.", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful.", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful.", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        UserSummaryDto summary = authService.getCurrentUserSummary(principal);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully.", "Session terminated."));
    }
}
