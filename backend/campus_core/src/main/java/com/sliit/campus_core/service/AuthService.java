package com.sliit.campus_core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sliit.campus_core.dto.LoginRequest;
import com.sliit.campus_core.dto.SignupRequest;
import com.sliit.campus_core.entity.Role;
import com.sliit.campus_core.entity.Status;
import com.sliit.campus_core.entity.User;
import com.sliit.campus_core.entity.UserType;
import com.sliit.campus_core.repository.UserRepository;
import com.sliit.campus_core.security.JwtUtil;

import java.util.Map;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

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

    public User assignRole(String userId, Role role) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(role);

        return userRepository.save(user);
    }
}