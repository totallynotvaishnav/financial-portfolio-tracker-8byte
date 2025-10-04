package com.portfolio.tracker.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PortfolioResponse {

    private Long id;
    private String name;
    private Long userId;
    private LocalDateTime createdAt;
    private BigDecimal totalValue;
    private BigDecimal totalCost;
    private BigDecimal totalGainLoss;
    private BigDecimal totalGainLossPercentage;
    private List<AssetResponse> assets;

    public PortfolioResponse() {
    }

    public PortfolioResponse(Long id, String name, Long userId, LocalDateTime createdAt, List<AssetResponse> assets) {
        this.id = id;
        this.name = name;
        this.userId = userId;
        this.createdAt = createdAt;
        this.assets = assets;

        // Calculate portfolio totals
        this.totalValue = assets.stream()
                .map(AssetResponse::getCurrentMarketValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.totalCost = assets.stream()
                .map(asset -> asset.getQuantity().multiply(asset.getAveragePrice()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.totalGainLoss = totalValue.subtract(totalCost);

        this.totalGainLossPercentage = totalCost.compareTo(BigDecimal.ZERO) > 0
                ? totalGainLoss.divide(totalCost, 4, java.math.RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public BigDecimal getTotalValue() {
        return totalValue;
    }

    public void setTotalValue(BigDecimal totalValue) {
        this.totalValue = totalValue;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }

    public BigDecimal getTotalGainLoss() {
        return totalGainLoss;
    }

    public void setTotalGainLoss(BigDecimal totalGainLoss) {
        this.totalGainLoss = totalGainLoss;
    }

    public BigDecimal getTotalGainLossPercentage() {
        return totalGainLossPercentage;
    }

    public void setTotalGainLossPercentage(BigDecimal totalGainLossPercentage) {
        this.totalGainLossPercentage = totalGainLossPercentage;
    }

    public List<AssetResponse> getAssets() {
        return assets;
    }

    public void setAssets(List<AssetResponse> assets) {
        this.assets = assets;
    }
}
