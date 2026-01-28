package com.mdp.sales_commission_system.controller;

import com.mdp.sales_commission_system.model.User;
import com.mdp.sales_commission_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175",
        "http://localhost:5176", "http://localhost:5177", "http://localhost:5178" })
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable String id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail())))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody Map<String, String> updates) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

        if (updates.containsKey("name")) {
            user.setName(updates.get("name"));
        }

        if (updates.containsKey("email")) {
            // Check if email is taken by another user
            String newEmail = updates.get("email");
            if (!newEmail.equals(user.getEmail()) && userRepository.findByEmail(newEmail).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
            }
            user.setEmail(newEmail);
        }

        // Basic password update if sent (plain text for now, should ideally require old
        // password)
        if (updates.containsKey("password") && !updates.get("password").isBlank()) {
            user.setPassword(passwordEncoder.encode(updates.get("password")));
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
}
