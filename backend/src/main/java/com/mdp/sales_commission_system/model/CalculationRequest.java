package com.mdp.sales_commission_system.model;

import java.util.List;

public class CalculationRequest {
    private User user;
    private Target target;
    private List<Deal> deals;
    private List<CommissionRule> rules;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Target getTarget() {
        return target;
    }

    public void setTarget(Target target) {
        this.target = target;
    }

    public List<Deal> getDeals() {
        return deals;
    }

    public void setDeals(List<Deal> deals) {
        this.deals = deals;
    }

    public List<CommissionRule> getRules() {
        return rules;
    }

    public void setRules(List<CommissionRule> rules) {
        this.rules = rules;
    }
}
