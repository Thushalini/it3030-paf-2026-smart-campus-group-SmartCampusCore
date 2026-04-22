package com.sliit.campus_core.security;

import java.security.Key;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;


@Component
public class JwtUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String SECRET_KEY;
    
    // NOTE: Use a sufficiently long secret for HS256 (>= 32 bytes). Replace with env/config in production.
    // private final String SECRET_KEY = "myverysecuresecretkey_that_is_at_least_32_bytes!";
    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 24; // 24 hours

    private Key getKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // Generate Token
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Extract Email
    public String extractEmail(String token) {
        return Jwts.parserBuilder().setSigningKey(getKey()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public String extractRole(String token) {
        return (String) Jwts.parserBuilder().setSigningKey(getKey()).build()
                .parseClaimsJws(token).getBody().get("role");
    }

    public boolean validateToken(String token, String email) {
        try {
            return extractEmail(token).equals(email) &&
                   !Jwts.parserBuilder().setSigningKey(getKey()).build()
                        .parseClaimsJws(token).getBody().getExpiration().before(new Date());
        } catch (JwtException e) {
            logger.debug("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

}