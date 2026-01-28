package com.mdp.sales_commission_system.service;

import com.mdp.sales_commission_system.model.CommissionRule;
import com.mdp.sales_commission_system.model.Deal;
import com.mdp.sales_commission_system.model.Target;
import com.mdp.sales_commission_system.model.User;
import com.mdp.sales_commission_system.repository.CompensationRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class CommissionService {

    private final CompensationRepository compensationRepository;

    public CommissionService(CompensationRepository compensationRepository) {
        this.compensationRepository = compensationRepository;
    }

    public double calculateCommission(User user, Target target, List<Deal> deals, List<CommissionRule> rules) {
        if (target == null || target.getAmount() == 0)
            return 0.0;

        // 1. Calculate Actual Sales (Closed Won only)
        // 1. Calculate Actual Sales (Closed Won only) (Converted to TL)
        double actualSales = deals.stream()
                .filter(d -> "CLOSED_WON".equalsIgnoreCase(d.getStatus()))
                .mapToDouble(d -> d.getAmount() * d.getExchangeRate()) // Normalize to TL
                .sum();

        // 2. Achievement Percentage
        double achievementPct = (actualSales / target.getAmount()) * 100.0;

        // 3. User Pay Mix (Base vs Variable)
        // Retrieve profile or default to 50/50 if not found
        com.mdp.sales_commission_system.model.CompensationProfile profile = compensationRepository
                .findByUserId(user.getId())
                .orElse(new com.mdp.sales_commission_system.model.CompensationProfile(user.getId(), 0, 0, 0));

        double annualVariablePay = profile.getAnnualOTE() * (profile.getVariableSplit() / 100.0);

        // Adjust for Period (Quarterly targets imply Quarterly Variable Pay)
        double periodVariablePay = annualVariablePay / 4.0;

        // 4. Calculate Payout based on Brackets
        // Sort rules by rangeStart
        rules.sort(Comparator.comparingDouble(CommissionRule::getRangeStart));

        System.out.println("DEBUG: Calculating Commission for User " + user.getId());
        System.out.println("DEBUG: Annual OTE: " + profile.getAnnualOTE());
        System.out.println("DEBUG: Variable Split: " + profile.getVariableSplit() + "%");
        System.out.println("DEBUG: Annual Variable Pay: " + annualVariablePay);
        System.out.println("DEBUG: Period Variable Pay (Quarterly): " + periodVariablePay);
        System.out.println("DEBUG: Target Amount: " + target.getAmount());
        System.out.println("DEBUG: Actual Sales (Normalized): " + actualSales);
        System.out.println("DEBUG: Achievement %: " + achievementPct);
        System.out.println("DEBUG: Number of Rules Found: " + rules.size());
        for (CommissionRule r : rules) {
            System.out.println(String.format("DEBUG: Rule: [%.2f - %.2f] x%.2f", r.getRangeStart(), r.getRangeEnd(),
                    r.getMultiplier()));
        }

        // 4. Calculate Payout
        double totalPayout = 0.0;

        // Logic (Explicit from User):
        // A. 0-100% (Decelerator/Gate): Retroactive Rate applied to ENTIRE achievement
        // Example: 80% Ach * 0.75 Rate = 60% of Pot Paid.
        // We find the Bracket that covers the current achievement and use its
        // multiplier.
        // B. >100% (Accelerator): Marginal Rate
        // Base (0-100%) = 100% Payout (1.0x).
        // Excess (>100%) = Excess % * Accelerator Multiplier.

        CommissionRule activeBaseRule = null;

        if (achievementPct <= 100.0) {
            // Retroactive Logic
            // Find the rule where RangeStart <= AchPct < RangeEnd (or <= RangeEnd)
            // Rules are: 0-50, 50-75, 75-90, 90-100
            for (CommissionRule rule : rules) {
                if (rule.getRangeStart() >= 100)
                    continue; // Skip accelerators

                // Check if this rule covers the current achievement
                // Example: Ach=80. Rules: 0-50 (No), 50-75 (No), 75-90 (YES)
                if (achievementPct > rule.getRangeStart() && achievementPct <= rule.getRangeEnd()) {
                    activeBaseRule = rule;
                    break;
                }
            }

            // Fallback: If exact match fails (e.g. edge cases), find highest applicable
            // base rate?
            // Actually, with standard gates (0, 50, 75, 90), 80 falls in 75-90.
            // If activeBaseRule is null (e.g. Ach=0), payout is 0.

            if (activeBaseRule != null) {
                // Payout = AchievementPct * Multiplier * PeriodVariablePay
                // Wait, User Formula: "80% Achievement (0.80) * 0.75 Rate = 0.60 Efficiency"
                // Payout = 60k * 0.60 = 36k.
                // 60k is the POT.
                // So: Payout = Pot * (AchPct/100) * Multiplier.
                double multiplier = activeBaseRule.getMultiplier();
                totalPayout = periodVariablePay * (achievementPct / 100.0) * multiplier;
                System.out.println(String.format(
                        "DEBUG: Retroactive [<100%%] -> Ach: %.2f%%, Rule: [%.0f-%.0f] x%.2f, Payout: %.2f",
                        achievementPct, activeBaseRule.getRangeStart(), activeBaseRule.getRangeEnd(), multiplier,
                        totalPayout));
            } else {
                System.out.println("DEBUG: Retroactive [<100%%] -> No matching rule found (Likely 0%%). Payout: 0");
            }

        } else {
            // Accelerator Logic (> 100%)
            // 1. Base Payout (100% Achieved)
            // User says: "100% -> 1.00 * 1 = 1.00".
            // So Base Portion is full Pot.
            double basePayout = periodVariablePay * 1.0;
            totalPayout += basePayout;

            // 2. Marginal Excess
            // Loop through accelerator tiers (Start >= 100)
            for (CommissionRule rule : rules) {
                if (rule.getRangeStart() < 100)
                    continue; // Skip base rules

                double start = rule.getRangeStart();
                double end = rule.getRangeEnd();

                if (achievementPct <= start)
                    continue;

                // Calculate overlap with this accelerator bracket
                double effectiveEnd = Math.min(achievementPct, end);
                double slidePcent = effectiveEnd - start; // e.g. 120 - 100 = 20

                // Payout for this slice = Slice% * Multiplier * Pot
                // Example: 20% * 1.5 = 30% of Pot.
                double bracketPayout = (slidePcent / 100.0) * periodVariablePay * rule.getMultiplier();
                totalPayout += bracketPayout;

                System.out.println(
                        String.format("DEBUG: Accelerator [%.0f-%.0f]: Span %.2f%%, Multiplier %.1f, Payout %.2f",
                                start, end, slidePcent, rule.getMultiplier(), bracketPayout));
            }
        }

        System.out.println("DEBUG: Total Commission Payout: " + totalPayout);

        return totalPayout;
    }
}
