package com.sliit.campus_core.controller;

import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.sliit.campus_core.dto.*;
import com.sliit.campus_core.entity.User;
import com.sliit.campus_core.service.AuthService;
import com.sliit.campus_core.exception.BadRequestException;
import com.sliit.campus_core.exception.InvalidCredentialsException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ✅ SIGNUP
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    // ✅ LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // ✅ GET CURRENT USER
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {

        if (authentication == null) {
            throw new InvalidCredentialsException("User not authenticated");
        }

        String email = authentication.getName();
        User user = authService.getUserByEmail(email);

        return ResponseEntity.ok(user);
    }

    // ✅ GOOGLE LOGIN
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {

        String googleToken = body.get("token");

        if (googleToken == null || googleToken.isBlank()) {
            throw new BadRequestException("Google token is required");
        }

        return ResponseEntity.ok(authService.googleLogin(googleToken));
    }

    // ✅ FORGOT PASSWORD
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request.getEmail()));
    }

    // ✅ RESET PASSWORD
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(
                authService.resetPassword(request.getToken(), request.getNewPassword())
        );
    }
}