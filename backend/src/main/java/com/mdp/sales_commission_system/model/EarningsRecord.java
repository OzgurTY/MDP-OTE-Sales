package com.mdp.sales_commission_system.model;

public class EarningsRecord {
    private String dealId;
    private String customerName;
    private double dealAmount;
    private double commissionAmount;
    private double appliedRate;
    private String status;
    private String date; // YYYY-MM-DD

    public String getDealId() {
        return dealId;
    }

    public void setDealId(String dealId) {
        this.dealId = dealId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public double getDealAmount() {
        return dealAmount;
    }

    public void setDealAmount(double dealAmount) {
        this.dealAmount = dealAmount;
    }

    public double getCommissionAmount() {
        return commissionAmount;
    }

    public void setCommissionAmount(double commissionAmount) {
        this.commissionAmount = commissionAmount;
    }

    public double getAppliedRate() {
        return appliedRate;
    }

    public void setAppliedRate(double appliedRate) {
        this.appliedRate = appliedRate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}
