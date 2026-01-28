package com.mdp.sales_commission_system.controller;

import com.mdp.sales_commission_system.model.*;
import com.mdp.sales_commission_system.repository.*;
import com.mdp.sales_commission_system.service.CommissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/earnings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class EarningsController {

    private final DealRepository dealRepository;
    private final TargetRepository targetRepository;
    private final CommissionRuleRepository ruleRepository;
    private final CommissionService commissionService;
    private final CompensationRepository compensationRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<List<EarningsRecord>> getEarnings(@PathVariable String userId) {
        // Fetch Data
        List<Deal> deals = dealRepository.findByUserId(userId);

        // Mock default Q1 target if not found - simplistic logic for now
        Target target = targetRepository.findByUserIdAndPeriod(userId, "Q1")
                .orElseGet(() -> {
                    Target t = new Target();
                    t.setAmount(0);
                    return t;
                });

        List<CommissionRule> rules = ruleRepository.findAllByUserId(userId);

        User user = new User();
        user.setId(userId);

        // Fetch Profile from Repo
        CompensationProfile profile = compensationRepository.findByUserId(userId)
                .orElse(new CompensationProfile(userId, 0, 0, 0)); // Default fallback to 0

        // We don't need to set OTE on User object anymore since Service fetches it,
        // but for consistency we can key off the User ID.

        // Basic calculation per deal is complex because accelerators depend on
        // cumulative progress.
        // For this demo, we will calculate the *marginal* commission for each deal in
        // date order?
        // Or just Average Rate?
        // Let's implement a simple "pro-rated" view:
        // Total Commission / Total Sales = Effective Rate.
        // Apply Effective Rate to each deal.
        // This is an approximation but good for a dashboard.

        double totalCommission = commissionService.calculateCommission(user, target, deals, rules);
        double totalSales = deals.stream()
                .filter(d -> "CLOSED_WON".equalsIgnoreCase(d.getStatus()))
                .mapToDouble(Deal::getAmount)
                .sum();

        double effectiveRate = totalSales > 0 ? totalCommission / totalSales : 0;

        List<EarningsRecord> records = new ArrayList<>();
        for (Deal deal : deals) {
            EarningsRecord r = new EarningsRecord();
            r.setDealId(deal.getId());
            r.setCustomerName(deal.getCustomerName());
            r.setDealAmount(deal.getAmount());
            r.setStatus(deal.getStatus());
            r.setDate(deal.getDate());

            if ("CLOSED_WON".equalsIgnoreCase(deal.getStatus())) {
                r.setCommissionAmount(deal.getAmount() * effectiveRate);
                r.setAppliedRate(effectiveRate);
            } else {
                r.setCommissionAmount(0);
                r.setAppliedRate(0);
            }
            records.add(r);
        }

        return ResponseEntity.ok(records);
    }
}
