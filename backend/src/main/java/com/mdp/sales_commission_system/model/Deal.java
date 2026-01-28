package com.mdp.sales_commission_system.model;

public class Deal {
    private String id;
    private String customerName;
    private double amount;
    private String date;
    private String status;
    private String userId;
    private String currency = "TRY"; // Default
    private double exchangeRate = 1.0;

    public static final String STATUS_OPPORTUNITY = "OPPORTUNITY";
    public static final String STATUS_PIPELINE = "PIPELINE";
    public static final String STATUS_UPSIDE = "UPSIDE";
    public static final String STATUS_COMMIT = "COMMIT";
    public static final String STATUS_WON = "CLOSED_WON";
    public static final String STATUS_LOST = "CLOSED_LOST";

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public double getExchangeRate() {
        return exchangeRate;
    }

    public void setExchangeRate(double exchangeRate) {
        this.exchangeRate = exchangeRate;
    }
}
