package com.sliit.campus_core.service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
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
import com.sliit.campus_core.exception.BadRequestException;
import com.sliit.campus_core.exception.EmailAlreadyExistsException;
import com.sliit.campus_core.exception.InvalidCredentialsException;
import com.sliit.campus_core.exception.UserNotFoundException;
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

    // ========================= SIGNUP =========================
    public Map<String, String> signup(SignupRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email is already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setRole(Role.USER);
        user.setUserType(UserType.valueOf(request.getUserType()));

        user.setPhone(request.getPhone());
        user.setDepartment(request.getDepartment());

        user.setStatus(Status.ACTIVE);
        user.setProvider("LOCAL");

        user.setProfileImage(request.getProfileImage());

        user.setBookingNotifications(request.isBookingNotifications());
        user.setTicketNotifications(request.isTicketNotifications());
        user.setCommentNotifications(request.isCommentNotifications());

        if ("STUDENT".equals(request.getUserType())) {

            if (request.getStudentId() == null || request.getStudentId().isBlank()) {
                throw new BadRequestException("Student ID is required");
            }

            user.setStudentId(request.getStudentId());
            user.setStaffId(null);

        } else if ("STAFF".equals(request.getUserType())) {

            if (request.getStaffId() == null || request.getStaffId().isBlank()) {
                throw new BadRequestException("Staff ID is required");
            }

            user.setStaffId(request.getStaffId());
            user.setStudentId(null);
        }

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return Map.of(
                "token", token,
                "role", user.getRole().name(),
                "name", user.getName()
        );
    }

    // ========================= LOGIN =========================
    public Map<String, String> login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return Map.of(
                "token", token,
                "role", user.getRole().name(),
                "name", user.getName()
        );
    }

    // ========================= USER =========================
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    public User assignRole(String userId, Role role) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        user.setRole(role);

        return userRepository.save(user);
    }

    // ========================= GOOGLE LOGIN =========================
    public Map<String, String> googleLogin(String token) {

        try {

            if (googleClientId == null || googleClientId.isBlank()) {
                throw new BadRequestException("Google Client ID not configured");
            }

            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            )
            .setAudience(Collections.singletonList(googleClientId))
            .build();

            GoogleIdToken idToken = verifier.verify(token);

            if (idToken == null) {
                throw new BadRequestException("Invalid Google token");
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

        } catch (IOException | GeneralSecurityException e) {
            logger.error("Google login failed", e);
            throw new BadRequestException("Google login failed");
        }
    }

    // ========================= FORGOT PASSWORD =========================
    public Map<String, String> forgotPassword(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        String token = UUID.randomUUID().toString();

        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));

        userRepository.save(user);

        System.out.println("RESET TOKEN: " + token);

        return Map.of(
                "message", "Reset token generated",
                "token", token
        );
    }

    // ========================= RESET PASSWORD =========================
    public Map<String, String> resetPassword(String token, String newPassword) {

        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (user.getResetTokenExpiry() == null ||
                user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);

        return Map.of("message", "Password reset successful");
    }
}