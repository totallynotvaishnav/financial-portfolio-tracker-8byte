package com.portfolio.tracker.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public class SellAssetRequest {

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private BigDecimal quantity;

    @NotNull(message = "Current market price is required")
    @Positive(message = "Current market price must be positive")
    private BigDecimal currentMarketPrice;

    // Constructors
    public SellAssetRequest() {
    }

    public SellAssetRequest(BigDecimal quantity, BigDecimal currentMarketPrice) {
        this.quantity = quantity;
        this.currentMarketPrice = currentMarketPrice;
    }

    // Getters and Setters
    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getCurrentMarketPrice() {
        return currentMarketPrice;
    }

    public void setCurrentMarketPrice(BigDecimal currentMarketPrice) {
        this.currentMarketPrice = currentMarketPrice;
    }
}
