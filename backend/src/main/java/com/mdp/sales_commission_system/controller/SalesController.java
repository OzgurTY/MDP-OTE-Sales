package com.mdp.sales_commission_system.controller;

import com.mdp.sales_commission_system.model.Deal;
import com.mdp.sales_commission_system.repository.DealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SalesController {

    private final DealRepository dealRepository;
    private final com.mdp.sales_commission_system.service.ExchangeRateService exchangeRateService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Deal>> getDeals(@PathVariable String userId) {
        if ("all".equals(userId)) {
            return ResponseEntity.ok(dealRepository.findAll());
        }
        return ResponseEntity.ok(dealRepository.findByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<Deal> addDeal(@RequestBody Deal deal) {
        // Fetch current exchange rate for the deal's currency
        if (deal.getCurrency() != null) {
            double rate = exchangeRateService.getRate(deal.getCurrency());
            deal.setExchangeRate(rate);
        }
        Deal saved = dealRepository.save(deal);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeal(@PathVariable String id) {
        dealRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
