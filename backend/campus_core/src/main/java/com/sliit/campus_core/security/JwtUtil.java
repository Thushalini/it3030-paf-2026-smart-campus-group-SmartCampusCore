package com.sliit.campus_core.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;


@Component
public class JwtUtil {

    private final String SECRET_KEY = "mysecretkey123"; // change in production
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
            return false;
        }
    }

    // private boolean isTokenExpired(String token) {
    //     return extractClaims(token).getExpiration().before(new Date());
    // }

    // private Claims extractClaims(String token) {
    //     return Jwts.parser()
    //             .setSigningKey(SECRET_KEY)
    //             .parseClaimsJws(token)
    //             .getBody();
    // }
}