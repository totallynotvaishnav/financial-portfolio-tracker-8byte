package com.portfolio.tracker.controller;

import com.portfolio.tracker.config.JwtUtils;
import com.portfolio.tracker.dto.JwtResponse;
import com.portfolio.tracker.dto.LoginRequest;
import com.portfolio.tracker.dto.RegisterRequest;
import com.portfolio.tracker.entity.User;
import com.portfolio.tracker.repository.UserRepository;
import com.portfolio.tracker.service.TokenBlacklistService;
import com.portfolio.tracker.service.UserDetailsServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final TokenBlacklistService tokenBlacklistService;

    public AuthController(AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils,
            TokenBlacklistService tokenBlacklistService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserDetailsServiceImpl.UserPrincipal userPrincipal
                    = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();

            String jwt = jwtUtils.generateJwtToken(userPrincipal);
            String refreshToken = jwtUtils.generateRefreshToken(userPrincipal.getUsername());

            List<String> roles = userPrincipal.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            logger.info("User {} logged in successfully", loginRequest.getUsername());

            return ResponseEntity.ok(new JwtResponse(
                    jwt,
                    refreshToken,
                    userPrincipal.getId(),
                    userPrincipal.getUsername(),
                    userPrincipal.getEmail(),
                    roles));

        } catch (AuthenticationException e) {
            logger.warn("Authentication failed for user {}: {}", loginRequest.getUsername(), e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Authentication failed");
            errorResponse.put("message", "Invalid username or password");
            errorResponse.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        // Check if username exists
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Username already taken");
            errorResponse.put("message", "Username '" + signUpRequest.getUsername() + "' is already in use");
            errorResponse.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.badRequest().body(errorResponse);
        }

        // Check if email exists
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Email already in use");
            errorResponse.put("message", "Email '" + signUpRequest.getEmail() + "' is already registered");
            errorResponse.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.badRequest().body(errorResponse);
        }

        // Create new user
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());

        User savedUser = userRepository.save(user);

        logger.info("New user registered: {}", savedUser.getUsername());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("userId", savedUser.getId());
        response.put("username", savedUser.getUsername());
        response.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");

        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Refresh token required");
            errorResponse.put("message", "Refresh token is missing");
            errorResponse.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            if (jwtUtils.validateJwtToken(refreshToken) && jwtUtils.isRefreshToken(refreshToken)) {
                String username = jwtUtils.getUserNameFromJwtToken(refreshToken);
                // Verify user still exists
                userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                String newAccessToken = jwtUtils.generateTokenFromUsername(username);
                String newRefreshToken = jwtUtils.generateRefreshToken(username);

                Map<String, Object> response = new HashMap<>();
                response.put("token", newAccessToken);
                response.put("refreshToken", newRefreshToken);
                response.put("type", "Bearer");
                response.put("timestamp", System.currentTimeMillis());

                logger.info("Token refreshed for user: {}", username);

                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid refresh token");
                errorResponse.put("message", "Refresh token is invalid or expired");
                errorResponse.put("timestamp", System.currentTimeMillis());

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
        } catch (Exception e) {
            logger.error("Token refresh failed: {}", e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Token refresh failed");
            errorResponse.put("message", "Unable to refresh token");
            errorResponse.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletRequest request) {
        try {
            String jwt = parseJwt(request);

            if (jwt != null) {
                // Blacklist the token
                tokenBlacklistService.blacklistToken(jwt);
                logger.info("Token blacklisted successfully");
            }

            SecurityContextHolder.clearContext();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User logged out successfully");
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Logout failed: {}", e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Logout failed");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Not authenticated");
            errorResponse.put("message", "User is not authenticated");
            errorResponse.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        UserDetailsServiceImpl.UserPrincipal userPrincipal
                = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();

        Map<String, Object> response = new HashMap<>();
        response.put("id", userPrincipal.getId());
        response.put("username", userPrincipal.getUsername());
        response.put("email", userPrincipal.getEmail());
        response.put("roles", userPrincipal.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.toList()));
        response.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(response);
    }
}
