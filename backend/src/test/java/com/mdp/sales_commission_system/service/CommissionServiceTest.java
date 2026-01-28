package com.mdp.sales_commission_system.service;

import com.mdp.sales_commission_system.model.CommissionRule;
import com.mdp.sales_commission_system.model.Deal;
import com.mdp.sales_commission_system.model.Target;
import com.mdp.sales_commission_system.model.User;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CommissionServiceTest {

    // Simple stub for testing purposes
    private final com.mdp.sales_commission_system.repository.CompensationRepository repository = new com.mdp.sales_commission_system.repository.CompensationRepository() {
        private final java.util.Map<String, com.mdp.sales_commission_system.model.CompensationProfile> store = new java.util.HashMap<>();

        @Override
        public java.util.Optional<com.mdp.sales_commission_system.model.CompensationProfile> findByUserId(
                String userId) {
            return java.util.Optional.ofNullable(store.get(userId));
        }

        @Override
        public com.mdp.sales_commission_system.model.CompensationProfile save(
                com.mdp.sales_commission_system.model.CompensationProfile profile) {
            store.put(profile.getUserId(), profile);
            return profile;
        }
    };

    private final CommissionService commissionService = new CommissionService(repository);

    @Test
    void testStandardAchievement() {
        // Setup User: 600k Annual OTE, 0.4 PayMix = 240k Variable Annual -> 60k
        // Quarterly
        // We must stick this in the repo now
        User user = new User();
        user.setId("testUser1");

        // Save profile to repo
        com.mdp.sales_commission_system.model.CompensationProfile profile = new com.mdp.sales_commission_system.model.CompensationProfile(
                "testUser1", 600000, 60, 40);
        repository.save(profile);

        // Setup Target: 100k for the quarter
        Target target = new Target();
        target.setAmount(100000);

        // Setup Deals: 100k total
        List<Deal> deals = new ArrayList<>();
        Deal deal1 = new Deal();
        deal1.setAmount(100000);
        deal1.setStatus("CLOSED_WON");
        deals.add(deal1);

        // Rules: Standard 100% payout for 0-100%
        List<CommissionRule> rules = new ArrayList<>();
        CommissionRule baseRule = new CommissionRule();
        baseRule.setRangeStart(0);
        baseRule.setRangeEnd(100);
        baseRule.setMultiplier(1.0);
        rules.add(baseRule);

        // Calculation
        // Achievement = 100%. Payout = 600,000 * 0.40 / 4 = 60,000.
        double result = commissionService.calculateCommission(user, target, deals, rules);
        assertEquals(60000, result, 0.01);
    }

    @Test
    void testAccelerator() {
        // Setup User: 60k Quarterly Variable
        User user = new User();
        user.setId("testUser2");

        // Save profile to repo
        com.mdp.sales_commission_system.model.CompensationProfile profile = new com.mdp.sales_commission_system.model.CompensationProfile(
                "testUser2", 600000, 60, 40);
        repository.save(profile);

        // Setup Target: 100k
        Target target = new Target();
        target.setAmount(100000);

        // Setup Deals: 110k total (110% achievement)
        List<Deal> deals = new ArrayList<>();
        Deal deal1 = new Deal();
        deal1.setAmount(110000);
        deal1.setStatus("CLOSED_WON");
        deals.add(deal1);

        // Rules:
        List<CommissionRule> rules = new ArrayList<>();

        CommissionRule r1 = new CommissionRule();
        r1.setRangeStart(0);
        r1.setRangeEnd(100);
        r1.setMultiplier(1.0);
        rules.add(r1);

        CommissionRule r2 = new CommissionRule();
        r2.setRangeStart(100);
        r2.setRangeEnd(150);
        r2.setMultiplier(1.5);
        rules.add(r2);

        // Calculation
        // Tier 1 (0-100%): 60k * 1.0 = 60,000.
        // Tier 2 (100-110%): Covers 10% of quota.
        // 10% of Variable Pay (60k) is 6,000.
        // Multiplier 1.5 -> 6,000 * 1.5 = 9,000.
        // Total = 69,000.

        double result = commissionService.calculateCommission(user, target, deals, rules);
        assertEquals(69000, result, 0.01);
    }
}
