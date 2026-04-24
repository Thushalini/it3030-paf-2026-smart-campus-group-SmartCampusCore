package com.sliit.campus_core.security;

import java.io.IOException;
import java.util.Collections;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getRequestURI();
        String method = request.getMethod();   // <-- Ticket: ADD THIS

        // Ticket:Skip OPTIONS requests entirely (no JWT needed for preflight)
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        return path.equals("/api/auth/login")
            || path.equals("/api/auth/signup")
            || path.equals("/api/auth/google")
            || path.startsWith("/oauth2")
            || path.startsWith("/favicon.ico")
            || path.startsWith("/static/")
            || path.startsWith("/assets/")
            || path.startsWith("/api/v1/resources/")   // ← Ticket: resource dropdown
            || path.startsWith("/uploads/")             // ← Ticket: ticket images
            || path.startsWith("/api/files/");          // ← Tocket: file downloads
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        log.info("Request URI: {}", request.getRequestURI());

        final String authHeader = request.getHeader("Authorization");

        String email = null;
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                email = jwtUtil.extractEmail(token);
            } catch (JwtException e) {
                // Token is present but malformed or expired — reject immediately
                log.warn("JwtFilter: failed to extract email from token: {}", e.getMessage());
                sendUnauthorized(response, "Invalid or expired token");
                return;
            }
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                String role = jwtUtil.extractRole(token);
                if (jwtUtil.validateToken(token, email)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    email,
                                    null,
                                    Collections.singleton(() -> "ROLE_" + role)
                            );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    log.warn("JwtFilter: token validation failed for email={}", email);
                    // FIX Bug 1: don't silently fall through — reject here
                    sendUnauthorized(response, "Token invalid or authentication failed");
                    return;
                }
            } catch (JwtException e) {
                // FIX Bug 1: log with warn and respond — don't swallow silently
                log.warn("JwtFilter: role extraction failed for email={}: {}", email, e.getMessage());
                sendUnauthorized(response, "Token invalid or authentication failed");
                return;
            }

            System.out.println("Authorization header: " + authHeader);
            System.out.println("Token: " + token);
            System.out.println("Email: " + email);
        } else if (token == null) {
            log.debug("JwtFilter: no Bearer token found in Authorization header");
        }

        // FIX Bug 2: token present but auth still not set (shouldn't reach here now,
        // but kept as a safety net)
        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            sendUnauthorized(response, "Token invalid or authentication failed");
            return;
        }

        // FIX Bug 2: guard against calling doFilter on an already-committed response
        if (!response.isCommitted()) {
            filterChain.doFilter(request, response);
        }
    }

    // Helper to avoid repeating response-writing logic
    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }

}