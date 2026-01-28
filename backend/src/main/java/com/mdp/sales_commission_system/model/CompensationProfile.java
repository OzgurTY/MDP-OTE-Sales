package com.mdp.sales_commission_system.model;

public class CompensationProfile {
    private String userId;
    private double annualOTE;
    private double baseSplit; // e.g. 70.0
    private double variableSplit; // e.g. 30.0

    public CompensationProfile() {
    }

    public CompensationProfile(String userId, double annualOTE, double baseSplit, double variableSplit) {
        this.userId = userId;
        this.annualOTE = annualOTE;
        this.baseSplit = baseSplit;
        this.variableSplit = variableSplit;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public double getAnnualOTE() {
        return annualOTE;
    }

    public void setAnnualOTE(double annualOTE) {
        this.annualOTE = annualOTE;
    }

    public double getBaseSplit() {
        return baseSplit;
    }

    public void setBaseSplit(double baseSplit) {
        this.baseSplit = baseSplit;
    }

    public double getVariableSplit() {
        return variableSplit;
    }

    public void setVariableSplit(double variableSplit) {
        this.variableSplit = variableSplit;
    }
}
