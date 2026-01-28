package com.mdp.sales_commission_system.controller;

import com.mdp.sales_commission_system.model.CommissionRule;
import com.mdp.sales_commission_system.repository.CommissionRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rules")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CommissionRuleController {

    private final CommissionRuleRepository repository;

    @GetMapping
    public List<CommissionRule> getRules(@RequestParam(required = false) String userId) {
        if (userId != null) {
            return repository.findAllByUserId(userId);
        }
        return repository.findAll();
    }

    @PostMapping
    public CommissionRule createRule(@RequestBody CommissionRule rule) {
        return repository.save(rule);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable String id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
