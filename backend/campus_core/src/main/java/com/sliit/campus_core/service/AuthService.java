package com.sliit.campus_core.service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Map;
import java.time.LocalDateTime;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.sliit.campus_core.dto.LoginRequest;
import com.sliit.campus_core.dto.SignupRequest;
import com.sliit.campus_core.entity.Role;
import com.sliit.campus_core.entity.Status;
import com.sliit.campus_core.entity.User;
import com.sliit.campus_core.entity.UserType;
import com.sliit.campus_core.repository.UserRepository;
import com.sliit.campus_core.security.JwtUtil;

import jakarta.annotation.PostConstruct;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @PostConstruct
    public void debug() {
        System.out.println("GOOGLE CLIENT ID = " + googleClientId);
    }

    public Map<String, String> signup(SignupRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();

        // 🔹 Basic fields
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // 🔹 Role (default USER unless specified otherwise)
        user.setRole(Role.USER); // or keep Role.USER if you want strict control

        // 🔹 User type (STUDENT / STAFF)
        user.setUserType(UserType.valueOf(request.getUserType()));

        // 🔹 Additional fields
        user.setPhone(request.getPhone());
        user.setDepartment(request.getDepartment());

        // 🔹 Status (default)
        user.setStatus(Status.ACTIVE);

        // 🔹 Provider
        user.setProvider("LOCAL");

        // 🔹 Profile Image
        user.setProfileImage(request.getProfileImage());

        // 🔹 Notification Preferences
        user.setBookingNotifications(request.isBookingNotifications());
        user.setTicketNotifications(request.isTicketNotifications());
        user.setCommentNotifications(request.isCommentNotifications());

        // 🔹 Handle STUDENT vs STAFF properly
        if (request.getUserType().equals("STUDENT")) {

            if (request.getStudentId() == null) {
                throw new RuntimeException("Student ID is required");
            }

            user.setStudentId(request.getStudentId());
            user.setStaffId(null);

        } else if (request.getUserType().equals("STAFF")) {

            if (request.getStaffId() == null) {
                throw new RuntimeException("Staff ID is required");
            }

            user.setStaffId(request.getStaffId());
            user.setStudentId(null);
        }

        userRepository.save(user);

        // 🔹 Generate JWT
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return Map.of(
                "token", token,
                "role", user.getRole().name(),
                "name", user.getName()
        );
    }

    public Map<String, String> login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return Map.of("token", token, "role", user.getRole().name(), "name", user.getName());
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User assignRole(String userId, Role role) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(role);

        return userRepository.save(user);
    }
    
    public Map<String, String> googleLogin(String token) {

        try {

            if (googleClientId == null || googleClientId.isBlank()) {
                throw new RuntimeException("Google Client ID not configured");
            }

            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            )
            .setAudience(Collections.singletonList(googleClientId))
            .build();

            GoogleIdToken idToken = verifier.verify(token);

            if (idToken == null) {
                throw new RuntimeException("Invalid Google token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();

            String email = payload.getEmail();
            String name = (String) payload.get("name");

            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setEmail(email);
                        newUser.setName(name);
                        newUser.setPassword("");
                        newUser.setRole(Role.USER);
                        newUser.setUserType(UserType.STUDENT);
                        newUser.setStatus(Status.ACTIVE);
                        newUser.setProvider("GOOGLE");
                        return userRepository.save(newUser);
                    });

            String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

            return Map.of(
                    "token", jwt,
                    "role", user.getRole().name(),
                    "name", user.getName()
            );

        } catch (IOException | RuntimeException | GeneralSecurityException e) {
            logger.error("Google login failed", e);
            throw new RuntimeException("Google login failed: " + e.getMessage());
        }
    }

    public Map<String, String> forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        System.out.println(">>> FORGOT PASSWORD TOKEN FOR " + email + ": " + token);
        
        return Map.of("message", "Token generated successfully", "token", token);
    }

    public Map<String, String> resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return Map.of("message", "Password reset successfully");
    }

}