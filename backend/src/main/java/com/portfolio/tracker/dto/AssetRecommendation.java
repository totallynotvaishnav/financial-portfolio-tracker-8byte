package com.portfolio.tracker.dto;

import java.math.BigDecimal;

/**
 * DTO representing an AI-recommended asset for portfolio diversification
 */
public class AssetRecommendation {

    private String tickerSymbol;
    private String companyName;
    private String sector;
    private BigDecimal suggestedAllocation;
    private String rationale;
    private BigDecimal estimatedPrice;

    public AssetRecommendation() {
    }

    public AssetRecommendation(String tickerSymbol, String companyName, String sector,
            BigDecimal suggestedAllocation, String rationale, BigDecimal estimatedPrice) {
        this.tickerSymbol = tickerSymbol;
        this.companyName = companyName;
        this.sector = sector;
        this.suggestedAllocation = suggestedAllocation;
        this.rationale = rationale;
        this.estimatedPrice = estimatedPrice;
    }

    // Getters and Setters
    public String getTickerSymbol() {
        return tickerSymbol;
    }

    public void setTickerSymbol(String tickerSymbol) {
        this.tickerSymbol = tickerSymbol;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public BigDecimal getSuggestedAllocation() {
        return suggestedAllocation;
    }

    public void setSuggestedAllocation(BigDecimal suggestedAllocation) {
        this.suggestedAllocation = suggestedAllocation;
    }

    public String getRationale() {
        return rationale;
    }

    public void setRationale(String rationale) {
        this.rationale = rationale;
    }

    public BigDecimal getEstimatedPrice() {
        return estimatedPrice;
    }

    public void setEstimatedPrice(BigDecimal estimatedPrice) {
        this.estimatedPrice = estimatedPrice;
    }
}
