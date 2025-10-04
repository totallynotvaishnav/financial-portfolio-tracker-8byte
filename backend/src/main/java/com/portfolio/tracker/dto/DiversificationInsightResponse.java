package com.portfolio.tracker.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * DTO representing AI-driven portfolio diversification insights
 */
public class DiversificationInsightResponse {

    private Long portfolioId;
    private String portfolioName;
    private BigDecimal diversificationScore;
    private String riskLevel;
    private Map<String, BigDecimal> sectorAllocation;
    private List<AssetRecommendation> recommendations;
    private List<String> insights;
    private String overallAssessment;

    public DiversificationInsightResponse() {
    }

    public DiversificationInsightResponse(Long portfolioId, String portfolioName,
            BigDecimal diversificationScore, String riskLevel,
            Map<String, BigDecimal> sectorAllocation,
            List<AssetRecommendation> recommendations,
            List<String> insights, String overallAssessment) {
        this.portfolioId = portfolioId;
        this.portfolioName = portfolioName;
        this.diversificationScore = diversificationScore;
        this.riskLevel = riskLevel;
        this.sectorAllocation = sectorAllocation;
        this.recommendations = recommendations;
        this.insights = insights;
        this.overallAssessment = overallAssessment;
    }

    // Getters and Setters
    public Long getPortfolioId() {
        return portfolioId;
    }

    public void setPortfolioId(Long portfolioId) {
        this.portfolioId = portfolioId;
    }

    public String getPortfolioName() {
        return portfolioName;
    }

    public void setPortfolioName(String portfolioName) {
        this.portfolioName = portfolioName;
    }

    public BigDecimal getDiversificationScore() {
        return diversificationScore;
    }

    public void setDiversificationScore(BigDecimal diversificationScore) {
        this.diversificationScore = diversificationScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public Map<String, BigDecimal> getSectorAllocation() {
        return sectorAllocation;
    }

    public void setSectorAllocation(Map<String, BigDecimal> sectorAllocation) {
        this.sectorAllocation = sectorAllocation;
    }

    public List<AssetRecommendation> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<AssetRecommendation> recommendations) {
        this.recommendations = recommendations;
    }

    public List<String> getInsights() {
        return insights;
    }

    public void setInsights(List<String> insights) {
        this.insights = insights;
    }

    public String getOverallAssessment() {
        return overallAssessment;
    }

    public void setOverallAssessment(String overallAssessment) {
        this.overallAssessment = overallAssessment;
    }
}
