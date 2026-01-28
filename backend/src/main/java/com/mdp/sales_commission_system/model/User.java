package com.mdp.sales_commission_system.model;

public class User {
    private String id;
    private String name;
    private String email;
    private String password;
    private String role;
    private double baseSalary;
    private double annualOTE;
    private double payMix;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public double getBaseSalary() {
        return baseSalary;
    }

    public void setBaseSalary(double baseSalary) {
        this.baseSalary = baseSalary;
    }

    public double getAnnualOTE() {
        return annualOTE;
    }

    public void setAnnualOTE(double annualOTE) {
        this.annualOTE = annualOTE;
    }

    public double getPayMix() {
        return payMix;
    }

    public void setPayMix(double payMix) {
        this.payMix = payMix;
    }
}
