package com.mdp.sales_commission_system.controller;

import com.mdp.sales_commission_system.model.Deal;
import com.mdp.sales_commission_system.repository.DealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

    private final DealRepository dealRepository;

    @GetMapping("/funnel/{userId}")
    public ResponseEntity<Map<String, Object>> getFunnelAndConversions(@PathVariable String userId) {
        List<Deal> deals = dealRepository.findByUserId(userId);

        // Count by Status
        Map<String, Long> counts = deals.stream()
                .collect(Collectors.groupingBy(Deal::getStatus, Collectors.counting()));

        // Sum Amount by Status
        Map<String, Double> amounts = deals.stream()
                .collect(Collectors.groupingBy(
                        Deal::getStatus,
                        Collectors.summingDouble(Deal::getAmount)));

        // Calculate simple conversion rates (This is tricky on snapshot data,
        // usually needs history "moved from X to Y".
        // For now, we return the Funnel State).

        Map<String, Object> result = new HashMap<>();
        result.put("counts", counts);
        result.put("amounts", amounts);

        // Mock Conversion Rates for Demo (since we don't track history yet)
        Map<String, Double> rates = new HashMap<>();
        rates.put("pipelineToUpside", 0.45);
        rates.put("upsideToCommit", 0.60);
        rates.put("commitToWin", 0.85); // High confidence
        result.put("conversionRates", rates);

        return ResponseEntity.ok(result);
    }
}
