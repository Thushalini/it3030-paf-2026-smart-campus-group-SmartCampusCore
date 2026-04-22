package com.sliit.campus_core.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.sliit.campus_core.entity.Role;
import com.sliit.campus_core.entity.User;
import com.sliit.campus_core.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired private UserRepository userRepository;
    @Autowired private JwtUtil jwtUtil;

    @Value("${oauth2.redirect-uri:http://localhost:5173/oauth2/callback}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        String name  = oauthUser.getAttribute("name");

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setEmail(email);
            u.setName(name);
            u.setRole(Role.USER);
            u.setProvider("GOOGLE");
            return userRepository.save(u);
        });

        // Generate JWT and redirect to frontend with token in URL
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        response.sendRedirect(redirectUri + "?token=" + token + "&role=" + user.getRole().name());
    }
}