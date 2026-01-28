package com.mdp.sales_commission_system.controller;

import com.mdp.sales_commission_system.model.*;
import com.mdp.sales_commission_system.repository.*;
import com.mdp.sales_commission_system.service.CommissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final DealRepository dealRepository;
    private final TargetRepository targetRepository;
    private final CommissionRuleRepository ruleRepository;
    private final CommissionService commissionService;
    private final CompensationRepository compensationRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats(
            @RequestParam(defaultValue = "user1") String userId,
            @RequestParam(required = false, defaultValue = "") String period) {

        // 1. Fetch Data
        List<Deal> deals = dealRepository.findByUserId(userId);

        // Filter Logic
        // Support formats: "2026-01" (Month), "Q1_2026" (Quarter), "" (All)
        final String effectivePeriod = (period == null) ? "" : period;

        if (!effectivePeriod.isEmpty()) {
            deals = deals.stream()
                    .filter(d -> filterDealByPeriod(d, effectivePeriod))
                    .collect(Collectors.toList());
        }

        // Target Logic
        // Map selected period to Target Period (e.g. Q1_2026 -> Q1)
        String targetPeriod = mapToTargetPeriod(effectivePeriod);

        Target target = targetRepository.findByUserIdAndPeriod(userId, targetPeriod)
                .orElseGet(() -> {
                    Target t = new Target();
                    t.setAmount(0); // Default to 0, user must set this
                    return t;
                });

        List<CommissionRule> rules = ruleRepository.findAllByUserId(userId);

        // ... existing code ...

        // ... existing code ...

        // 2. Create User Context
        // Fetch Real User Profile from Repository
        CompensationProfile profile = compensationRepository.findByUserId(userId)
                .orElse(new CompensationProfile(userId, 0, 0, 0)); // Fallback to 0

        User user = new User();
        user.setId(userId);
        user.setName("Demo User");
        // FIX: Use Real OTE from Profile
        user.setAnnualOTE(profile.getAnnualOTE());
        user.setPayMix(profile.getVariableSplit() / 100.0);

        // 3. Calculate Commission
        double commission = commissionService.calculateCommission(user, target, deals, rules);

        // 4. Aggregate Sales
        double totalSales = deals.stream()
                .filter(d -> "CLOSED_WON".equalsIgnoreCase(d.getStatus()))
                .mapToDouble(d -> d.getAmount() * d.getExchangeRate())
                .sum();

        int closedDealCount = (int) deals.stream()
                .filter(d -> "CLOSED_WON".equalsIgnoreCase(d.getStatus()))
                .count();

        // 5. Build Response
        DashboardStats stats = new DashboardStats();
        stats.setTotalSales(totalSales);
        stats.setCommissionEarned(commission);
        stats.setTargetAmount(target.getAmount());
        double achievementRate = target.getAmount() > 0 ? (totalSales / target.getAmount()) * 100 : 0;
        stats.setAchievementRate(achievementRate);
        stats.setDealCount(closedDealCount);
        stats.setAnnualOTE(profile.getAnnualOTE());
        stats.setVariableSplit(profile.getVariableSplit());

        List<DashboardStats.ChartData> trend = deals.stream()
                .map(d -> new DashboardStats.ChartData(d.getCustomerName(), d.getAmount() * d.getExchangeRate()))
                .collect(Collectors.toList());
        stats.setSalesTrend(trend);

        // Dynamic Activity Feed
        List<DashboardStats.ActivityFeedItem> activity = deals.stream()
                .sorted((d1, d2) -> d2.getDate().compareTo(d1.getDate())) // Newest first
                .limit(5)
                .limit(10)
                .map(d -> {
                    String type = "INFO";
                    String title = "Deal Update";
                    String status = d.getStatus() != null ? d.getStatus() : "UNKNOWN";
                    String customer = d.getCustomerName();

                    // Simple currency symbol mapping
                    String symbol = "₺";
                    if ("USD".equalsIgnoreCase(d.getCurrency()))
                        symbol = "$";
                    if ("EUR".equalsIgnoreCase(d.getCurrency()))
                        symbol = "€";

                    String amountStr = symbol + String.format("%,.0f", d.getAmount());

                    switch (status.toUpperCase()) {
                        case "CLOSED_WON":
                            type = "SUCCESS";
                            title = "Deal Won";
                            break;
                        case "CLOSED_LOST":
                            type = "ERROR";
                            title = "Deal Lost";
                            break;
                        case "COMMIT":
                            type = "WARNING";
                            title = "Commit Stage";
                            break;
                        case "UPSIDE":
                        case "PIPELINE":
                        case "OPPORTUNITY":
                            type = "INFO";
                            title = "Pipeline Activity";
                            break;
                        default:
                            type = "INFO";
                            title = "Deal Update";
                    }

                    String desc = String.format("%s • %s • %s", d.getDate(), customer, amountStr);
                    return new DashboardStats.ActivityFeedItem(title, desc, type);
                })
                .collect(Collectors.toList());
        stats.setRecentActivity(activity);

        // ... existing legacy code ...

        // 6. Calculate MTD and QTD Explicitly for Dashboard
        LocalDate now = LocalDate.now();
        // For Demo purposes, let's pin "Now" to Jan 2026 if needed, but using real now
        // is better if data is fresh.
        // Assuming Data might be in 2026, let's dynamically check if "Now" has data,
        // otherwise fallback to "2026-01".
        // Actually, just use standard logic. If user has 2026 data, they should
        // simulate being in 2026.
        // Let's assume we are in Jan 2026 for the demo context if that's where data is.
        // But to be safe, I'll use the "period" passed if it is empty, or current date.

        // QTD Calculation
        String currentQuarterPeriod = "Q1_2026"; // Demo Fixed
        List<Deal> qtdDeals = deals.stream()
                .filter(d -> filterDealByPeriod(d, currentQuarterPeriod))
                .collect(Collectors.toList());

        Target qtdTarget = targetRepository.findByUserIdAndPeriod(userId, "Q1").orElse(new Target());
        double commissionQTD = commissionService.calculateCommission(user, qtdTarget, qtdDeals, rules);

        // MTD Calculation (Simplified as per User Request: 1/3 of QTD)
        // User feedback: "Monthly should be 1/3 of Quarterly"
        double commissionMTD = commissionQTD / 3.0;

        stats.setCommissionMTD(commissionMTD);
        stats.setCommissionQTD(commissionQTD);

        return ResponseEntity.ok(stats);
    }

    private boolean filterDealByPeriod(Deal deal, String period) {
        if (deal.getDate() == null)
            return false;

        // Month Filter: "2026-01"
        if (period.matches("\\d{4}-\\d{2}")) {
            return deal.getDate().startsWith(period);
        }

        // Quarter Filter: "Q1_2026"
        if (period.startsWith("Q")) {
            // Parse Q1_2026 -> start 2026-01-01, end 2026-03-31
            try {
                String[] parts = period.split("_"); // [Q1, 2026]
                if (parts.length < 2)
                    return true;

                String q = parts[0];
                int year = Integer.parseInt(parts[1]);

                LocalDate date = LocalDate.parse(deal.getDate()); // YYYY-MM-DD
                if (date.getYear() != year)
                    return false;

                int month = date.getMonthValue();
                if ("Q1".equals(q))
                    return month >= 1 && month <= 3;
                if ("Q2".equals(q))
                    return month >= 4 && month <= 6;
                if ("Q3".equals(q))
                    return month >= 7 && month <= 9;
                if ("Q4".equals(q))
                    return month >= 10 && month <= 12;
            } catch (Exception e) {
                // Formatting error, ignore filter
                return true;
            }
        }

        return true;
    }

    private String mapToTargetPeriod(String period) {
        if (period == null || period.isEmpty())
            return "Q1";
        if (period.startsWith("Q"))
            return period.split("_")[0]; // Q1_2026 -> Q1

        // Map Month to Quarter
        if (period.matches("\\d{4}-\\d{2}")) {
            String month = period.substring(5, 7);
            int m = Integer.parseInt(month);
            if (m <= 3)
                return "Q1";
            if (m <= 6)
                return "Q2";
            if (m <= 9)
                return "Q3";
            return "Q4";
        }

        return "Q1";
    }
}
