package com.campus.operations.controller;

import com.campus.operations.dto.LoginResponse;
import com.campus.operations.entity.User;
import com.campus.operations.entity.UserRole;
import com.campus.operations.repository.UserRepository;
import com.campus.operations.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    
    public AuthController(JwtTokenProvider tokenProvider, UserRepository userRepository) {
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
    }
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestParam String email, 
                                              @RequestParam String name, 
                                              @RequestParam UserRole role) {
        
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User(email, name, role);
                    return userRepository.save(newUser);
                });
        
        String token = tokenProvider.generateToken(email);
        
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setRole(user.getRole());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/me")
    public ResponseEntity<LoginResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        LoginResponse response = new LoginResponse();
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setRole(user.getRole());
        
        return ResponseEntity.ok(response);
    }
}
