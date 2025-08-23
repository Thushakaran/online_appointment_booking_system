package com.se.Online.Appointment.Booking.System.security;

import com.se.Online.Appointment.Booking.System.service.impl.CustomUserDetailsService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {

        System.out.println("=== JWT Filter Debug ===");
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Request Method: " + request.getMethod());

        String header = request.getHeader("Authorization");
        String token = null;

        System.out.println("Authorization header: "
                + (header != null ? header.substring(0, Math.min(50, header.length())) + "..." : "null"));

        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7).trim();
            if (token.isEmpty() || "null".equalsIgnoreCase(token)) {
                token = null;
            }
        }

        System.out.println("Extracted token: "
                + (token != null ? token.substring(0, Math.min(30, token.length())) + "..." : "null"));

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                // Parse once and reuse
                Claims claims = jwtUtil.parseClaims(token);
                String username = claims.getSubject();
                String role = claims.get("role", String.class);
                System.out.println("JWT Subject (username): " + username);
                System.out.println("JWT Role: " + role);

                if (username != null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    System.out.println("Loaded user details: " + userDetails.getUsername());
                    System.out.println("User authorities: " + userDetails.getAuthorities());

                    // Optional: confirm subject matches and token still valid
                    if (jwtUtil.isTokenValid(token, userDetails.getUsername())) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        System.out.println("Authentication set successfully");
                    } else {
                        System.out.println("Token validation failed");
                    }
                }
            } catch (JwtException | IllegalArgumentException ex) {
                // SignatureException, ExpiredJwtException, MalformedJwtException, etc.
                System.err.println("JWT parsing error: " + ex.getMessage());
                ex.printStackTrace();
            }
        } else {
            System.out.println("No token or authentication already exists");
        }

        System.out.println("Current authentication: " + SecurityContextHolder.getContext().getAuthentication());
        System.out.println("=== End JWT Filter Debug ===");

        chain.doFilter(request, response);
    }
}
