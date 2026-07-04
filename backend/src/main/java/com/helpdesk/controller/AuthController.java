package com.helpdesk.controller;

import com.helpdesk.dto.request.AuthRequest;
import com.helpdesk.dto.response.ApiResponse;
import com.helpdesk.dto.response.AuthResponse;
import com.helpdesk.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody AuthRequest.Register request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("User registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody AuthRequest.Login request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }
    
    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestParam String token) {
        String message = authService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.ok(message, message));
    }
    
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<String>> resendVerification(@RequestBody java.util.Map<String, String> request) {
        String message = authService.resendVerificationEmail(request.get("email"));
        return ResponseEntity.ok(ApiResponse.ok(message, message));
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        String message = authService.forgotPassword(request.get("email"));
        return ResponseEntity.ok(ApiResponse.ok(message, message));
    }
    
    @PostMapping("/verify-reset-code")
    public ResponseEntity<ApiResponse<String>> verifyResetCode(@RequestBody java.util.Map<String, String> request) {
        String token = authService.verifyResetCode(request.get("email"), request.get("code"));
        return ResponseEntity.ok(ApiResponse.ok("Code verified", token));
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody java.util.Map<String, String> request) {
        String message = authService.resetPassword(request.get("token"), request.get("newPassword"));
        return ResponseEntity.ok(ApiResponse.ok(message, message));
    }
}
