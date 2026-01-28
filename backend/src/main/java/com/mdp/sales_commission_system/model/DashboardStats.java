package com.mdp.sales_commission_system.model;

import java.util.List;

public class DashboardStats {
    private double totalSales;
    private double commissionEarned; // Filtered Period
    private double commissionMTD; // Current Month
    private double commissionQTD; // Current Quarter
    private double targetAmount;
    private double achievementRate;
    private int dealCount;
    private double annualOTE;
    private List<ChartData> salesTrend;
    private List<ActivityFeedItem> recentActivity;

    public double getCommissionMTD() {
        return commissionMTD;
    }

    public void setCommissionMTD(double commissionMTD) {
        this.commissionMTD = commissionMTD;
    }

    public double getCommissionQTD() {
        return commissionQTD;
    }

    public void setCommissionQTD(double commissionQTD) {
        this.commissionQTD = commissionQTD;
    }

    public int getDealCount() {
        return dealCount;
    }

    public void setDealCount(int dealCount) {
        this.dealCount = dealCount;
    }

    public double getAnnualOTE() {
        return annualOTE;
    }

    public void setAnnualOTE(double annualOTE) {
        this.annualOTE = annualOTE;
    }

    public List<ActivityFeedItem> getRecentActivity() {
        return recentActivity;
    }

    public void setRecentActivity(List<ActivityFeedItem> recentActivity) {
        this.recentActivity = recentActivity;
    }

    public static class ActivityFeedItem {
        private String title;
        private String description;
        private String type; // SUCCESS, INFO, WARNING

        public ActivityFeedItem(String title, String description, String type) {
            this.title = title;
            this.description = description;
            this.type = type;
        }

        // Getters and Setters needed for JSON serialization
        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }
    }

    public double getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(double totalSales) {
        this.totalSales = totalSales;
    }

    public double getCommissionEarned() {
        return commissionEarned;
    }

    public void setCommissionEarned(double commissionEarned) {
        this.commissionEarned = commissionEarned;
    }

    public double getTargetAmount() {
        return targetAmount;
    }

    public void setTargetAmount(double targetAmount) {
        this.targetAmount = targetAmount;
    }

    public double getAchievementRate() {
        return achievementRate;
    }

    public void setAchievementRate(double achievementRate) {
        this.achievementRate = achievementRate;
    }

    public List<ChartData> getSalesTrend() {
        return salesTrend;
    }

    public void setSalesTrend(List<ChartData> salesTrend) {
        this.salesTrend = salesTrend;
    }

    public static class ChartData {
        private String name;
        private double value;

        public ChartData(String name, double value) {
            this.name = name;
            this.value = value;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public double getValue() {
            return value;
        }

        public void setValue(double value) {
            this.value = value;
        }
    }

    private double variableSplit; // e.g. 50.0

    public double getVariableSplit() {
        return variableSplit;
    }

    public void setVariableSplit(double variableSplit) {
        this.variableSplit = variableSplit;
    }
}
