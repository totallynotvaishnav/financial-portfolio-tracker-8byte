package com.portfolio.tracker.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AssetResponse {

    private Long id;
    private String tickerSymbol;
    private BigDecimal quantity;
    private BigDecimal averagePrice;
    private BigDecimal currentMarketPrice;
    private BigDecimal currentMarketValue;
    private BigDecimal gainLoss;
    private BigDecimal gainLossPercentage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AssetResponse() {
    }

    public AssetResponse(Long id, String tickerSymbol, BigDecimal quantity, BigDecimal averagePrice,
            BigDecimal currentMarketPrice, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.tickerSymbol = tickerSymbol;
        this.quantity = quantity;
        this.averagePrice = averagePrice;
        this.currentMarketPrice = currentMarketPrice;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        // Calculate derived values
        this.currentMarketValue = quantity.multiply(currentMarketPrice);
        BigDecimal totalCost = quantity.multiply(averagePrice);
        this.gainLoss = currentMarketValue.subtract(totalCost);
        this.gainLossPercentage = totalCost.compareTo(BigDecimal.ZERO) > 0
                ? gainLoss.divide(totalCost, 4, java.math.RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTickerSymbol() {
        return tickerSymbol;
    }

    public void setTickerSymbol(String tickerSymbol) {
        this.tickerSymbol = tickerSymbol;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getAveragePrice() {
        return averagePrice;
    }

    public void setAveragePrice(BigDecimal averagePrice) {
        this.averagePrice = averagePrice;
    }

    public BigDecimal getCurrentMarketPrice() {
        return currentMarketPrice;
    }

    public void setCurrentMarketPrice(BigDecimal currentMarketPrice) {
        this.currentMarketPrice = currentMarketPrice;
    }

    public BigDecimal getCurrentMarketValue() {
        return currentMarketValue;
    }

    public void setCurrentMarketValue(BigDecimal currentMarketValue) {
        this.currentMarketValue = currentMarketValue;
    }

    public BigDecimal getGainLoss() {
        return gainLoss;
    }

    public void setGainLoss(BigDecimal gainLoss) {
        this.gainLoss = gainLoss;
    }

    public BigDecimal getGainLossPercentage() {
        return gainLossPercentage;
    }

    public void setGainLossPercentage(BigDecimal gainLossPercentage) {
        this.gainLossPercentage = gainLossPercentage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
