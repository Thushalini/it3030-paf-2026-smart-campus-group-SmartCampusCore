package com.sliit.campus_core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults()) // enable CORS using CorsConfig
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/resources/**").permitAll() // allow resources endpoint
                .requestMatchers("/api/v1/tickets/**").permitAll()
                .requestMatchers("/api/v1/tickets/*/comments/**").permitAll()
                .requestMatchers("/api/files/**").permitAll()
                .anyRequest().authenticated()                       // everything else requires auth
            )
            .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}
