package com.mdp.sales_commission_system.controller;

import com.mdp.sales_commission_system.model.CompensationProfile;
import com.mdp.sales_commission_system.repository.CompensationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/compensation")
@CrossOrigin(origins = "http://localhost:5173")
public class CompensationController {

    private final CompensationRepository repository;

    public CompensationController(CompensationRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<CompensationProfile> getProfile(@PathVariable String userId) {
        return repository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public CompensationProfile updateProfile(@RequestBody CompensationProfile profile) {
        return repository.save(profile);
    }
}
