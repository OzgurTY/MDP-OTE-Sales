package com.mdp.sales_commission_system.controller;

import com.mdp.sales_commission_system.model.User;
import com.mdp.sales_commission_system.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175",
        "http://localhost:5176", "http://localhost:5177", "http://localhost:5178" })
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER"); // Default role

        // Initialize with zeros - User must configure settings
        user.setAnnualOTE(0);
        user.setPayMix(0);

        User saved = userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully", "userId", saved.getId()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                // For MVP, we return simple User info. In production, return JWT.
                return ResponseEntity.ok(Map.of(
                        "token", "mock-jwt-token-" + user.getId(),
                        "user", Map.of(
                                "id", user.getId(),
                                "email", user.getEmail(),
                                "name", user.getName())));
            }
        }

        return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
    }

    @Data
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }
}
