package com.mdp.sales_commission_system.controller;

import com.mdp.sales_commission_system.model.Target;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/targets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class TargetController {

    private final com.mdp.sales_commission_system.repository.TargetRepository targetRepository;

    @GetMapping("/{userId}/{period}")
    public ResponseEntity<Target> getTarget(@PathVariable String userId, @PathVariable String period) {
        return targetRepository.findByUserIdAndPeriod(userId, period)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Target> saveTarget(@RequestBody Target target) {
        return ResponseEntity.ok(targetRepository.save(target));
    }
}
