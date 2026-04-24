package com.sliit.campus_core.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sliit.campus_core.dto.LoginRequest;
import com.sliit.campus_core.dto.SignupRequest;
import com.sliit.campus_core.dto.ForgotPasswordRequest;
import com.sliit.campus_core.dto.ResetPasswordRequest;
import com.sliit.campus_core.entity.User;
import com.sliit.campus_core.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // 🔥 NEW: Get logged-in user
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String email = authentication.getName();

        User user = authService.getUserByEmail(email);

        return ResponseEntity.ok(user);
    }

    // 🔥 NEW: Google login
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        System.out.println(">>> /api/auth/google hit, body keys: " + body.keySet());
        System.out.println(">>> token value: " + body.get("token"));
        
        String googleToken = body.get("token");
        if (googleToken == null || googleToken.isBlank()) {
            return ResponseEntity.badRequest().body("Missing token");
        }
        return ResponseEntity.ok(authService.googleLogin(googleToken));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request.getEmail()));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request.getToken(), request.getNewPassword()));
    }
}