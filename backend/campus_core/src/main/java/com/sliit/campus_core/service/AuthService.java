package com.sliit.campus_core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sliit.campus_core.dto.LoginRequest;
import com.sliit.campus_core.dto.SignupRequest;
import com.sliit.campus_core.entity.Role;
import com.sliit.campus_core.entity.User;
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
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        user.setProvider("LOCAL");
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return Map.of("token", token, "role", user.getRole().name(), "name", user.getName());
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
}