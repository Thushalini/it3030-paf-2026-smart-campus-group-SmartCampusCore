package com.sliit.campus_core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import com.sliit.campus_core.security.OAuth2LoginSuccessHandler;

@Configuration
public class SecurityConfig {

    private final OAuth2LoginSuccessHandler successHandler;

    // Constructor Injection
    public SecurityConfig(OAuth2LoginSuccessHandler successHandler) {
        this.successHandler = successHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/technician/**").hasRole("TECHNICIAN")
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )
            .oauth2Login(oauth -> oauth
                .successHandler(successHandler)
            );

        return http.build();
    }
}