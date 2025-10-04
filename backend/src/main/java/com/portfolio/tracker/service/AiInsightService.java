package com.portfolio.tracker.service;

import com.portfolio.tracker.dto.AssetRecommendation;
import com.portfolio.tracker.dto.DiversificationInsightResponse;
import com.portfolio.tracker.entity.Asset;
import com.portfolio.tracker.entity.Portfolio;
import com.portfolio.tracker.entity.Stock;
import com.portfolio.tracker.exception.ResourceNotFoundException;
import com.portfolio.tracker.repository.PortfolioRepository;
import com.portfolio.tracker.repository.StockRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiInsightService {

    private final PortfolioRepository portfolioRepository;
    private final StockRepository stockRepository;

    public AiInsightService(PortfolioRepository portfolioRepository, StockRepository stockRepository) {
        this.portfolioRepository = portfolioRepository;
        this.stockRepository = stockRepository;
    }

    public DiversificationInsightResponse generateDiversificationInsights(Long portfolioId) {
        Portfolio portfolio = portfolioRepository.findByIdWithAssets(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + portfolioId));

        if (portfolio.getAssets() == null || portfolio.getAssets().isEmpty()) {
            return createEmptyPortfolioInsight(portfolio);
        }

        Map<String, BigDecimal> sectorAllocation = calculateSectorAllocationFromAssets(portfolio.getAssets());
        int totalPositions = portfolio.getAssets().size();

        // Calculate diversification score
        BigDecimal diversificationScore = calculateDiversificationScore(sectorAllocation, totalPositions);

        // Determine risk level
        String riskLevel = determineRiskLevel(diversificationScore, sectorAllocation);

        // Generate recommendations
        List<AssetRecommendation> recommendations = generateRecommendations(sectorAllocation);

        // Generate insights
        List<String> insights = generateInsights(sectorAllocation, totalPositions, diversificationScore);

        // Overall assessment
        String overallAssessment = generateOverallAssessment(diversificationScore);

        return new DiversificationInsightResponse(
                portfolio.getId(),
                portfolio.getPortfolioName(),
                diversificationScore,
                riskLevel,
                sectorAllocation,
                recommendations,
                insights,
                overallAssessment
        );
    }

    private DiversificationInsightResponse createEmptyPortfolioInsight(Portfolio portfolio) {
        List<AssetRecommendation> recommendations = Arrays.asList(
                new AssetRecommendation("SPY", "SPDR S&P 500 ETF", "Diversified",
                        new BigDecimal("30"), "Broad market exposure for instant diversification", new BigDecimal("420.50")),
                new AssetRecommendation("QQQ", "Invesco QQQ Trust", "Technology",
                        new BigDecimal("20"), "Technology sector exposure", new BigDecimal("385.20")),
                new AssetRecommendation("VTI", "Vanguard Total Stock Market ETF", "Diversified",
                        new BigDecimal("25"), "Total market exposure with low fees", new BigDecimal("245.80"))
        );

        return new DiversificationInsightResponse(
                portfolio.getId(),
                portfolio.getPortfolioName(),
                BigDecimal.ZERO,
                "N/A",
                new HashMap<>(),
                recommendations,
                Arrays.asList("Portfolio is empty. Consider adding diversified ETFs to start building a balanced portfolio."),
                "Start building your portfolio with broad market ETFs for instant diversification."
        );
    }

    private Map<String, BigDecimal> calculateSectorAllocationFromAssets(List<Asset> assets) {
        Map<String, BigDecimal> sectorValues = new HashMap<>();
        BigDecimal totalValue = BigDecimal.ZERO;

        // Calculate total value and sector values
        for (Asset asset : assets) {
            // Look up stock information by ticker symbol
            Optional<Stock> stockOpt = stockRepository.findBySymbol(asset.getTickerSymbol());

            String sector = stockOpt.map(Stock::getSector).orElse("Other");
            if (sector == null || sector.trim().isEmpty()) {
                sector = "Other";
            }

            BigDecimal assetValue = asset.getQuantity().multiply(asset.getAveragePrice());
            sectorValues.merge(sector, assetValue, BigDecimal::add);
            totalValue = totalValue.add(assetValue);
        }

        // Convert to percentages
        return convertToPercentages(sectorValues, totalValue);
    }

    private Map<String, BigDecimal> convertToPercentages(Map<String, BigDecimal> sectorValues, BigDecimal totalValue) {
        Map<String, BigDecimal> sectorPercentages = new HashMap<>();
        for (Map.Entry<String, BigDecimal> entry : sectorValues.entrySet()) {
            if (totalValue.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal percentage = entry.getValue()
                        .divide(totalValue, 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));
                sectorPercentages.put(entry.getKey(), percentage);
            }
        }
        return sectorPercentages;
    }

    private BigDecimal calculateDiversificationScore(Map<String, BigDecimal> sectorAllocation, int numberOfHoldings) {
        if (sectorAllocation.isEmpty()) {
            return BigDecimal.ZERO;
        }

        // Base score calculation using Herfindahl-Hirschman Index inverse
        BigDecimal hhi = sectorAllocation.values().stream()
                .map(percentage -> percentage.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP))
                .map(decimal -> decimal.multiply(decimal))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Convert HHI to diversification score (0-100 scale)
        BigDecimal diversificationScore = BigDecimal.ONE.subtract(hhi).multiply(new BigDecimal("100"));

        // Adjust based on number of holdings (more holdings generally means better diversification)
        BigDecimal holdingBonus = BigDecimal.valueOf(Math.min(numberOfHoldings * 2, 20));
        diversificationScore = diversificationScore.add(holdingBonus);

        // Cap at 100
        return diversificationScore.min(new BigDecimal("100"));
    }

    private String determineRiskLevel(BigDecimal diversificationScore, Map<String, BigDecimal> sectorAllocation) {
        // Check for concentration risk
        boolean hasHighConcentration = sectorAllocation.values().stream()
                .anyMatch(percentage -> percentage.compareTo(new BigDecimal("60")) > 0);

        if (hasHighConcentration || diversificationScore.compareTo(new BigDecimal("40")) < 0) {
            return "HIGH";
        } else if (diversificationScore.compareTo(new BigDecimal("70")) >= 0) {
            return "LOW";
        } else {
            return "MODERATE";
        }
    }

    private List<AssetRecommendation> generateRecommendations(Map<String, BigDecimal> sectorAllocation) {
        List<AssetRecommendation> recommendations = new ArrayList<>();

        // Check for missing major sectors and recommend accordingly
        if (!sectorAllocation.containsKey("Healthcare")
                || sectorAllocation.getOrDefault("Healthcare", BigDecimal.ZERO).compareTo(new BigDecimal("10")) < 0) {
            recommendations.add(new AssetRecommendation("JNJ", "Johnson & Johnson", "Healthcare",
                    new BigDecimal("10"), "Add healthcare sector exposure for defensive positioning", new BigDecimal("162.30")));
        }

        if (!sectorAllocation.containsKey("Financial Services")
                || sectorAllocation.getOrDefault("Financial Services", BigDecimal.ZERO).compareTo(new BigDecimal("10")) < 0) {
            recommendations.add(new AssetRecommendation("JPM", "JPMorgan Chase & Co", "Financial Services",
                    new BigDecimal("10"), "Financial sector exposure benefits from rising interest rates", new BigDecimal("165.40")));
        }

        if (!sectorAllocation.containsKey("Consumer Defensive")
                || sectorAllocation.getOrDefault("Consumer Defensive", BigDecimal.ZERO).compareTo(new BigDecimal("5")) < 0) {
            recommendations.add(new AssetRecommendation("PG", "Procter & Gamble", "Consumer Defensive",
                    new BigDecimal("8"), "Consumer staples provide stability during market downturns", new BigDecimal("155.75")));
        }

        // If too concentrated in Technology, recommend other sectors
        if (sectorAllocation.getOrDefault("Technology", BigDecimal.ZERO).compareTo(new BigDecimal("50")) > 0) {
            recommendations.add(new AssetRecommendation("VTI", "Vanguard Total Stock Market ETF", "Diversified",
                    new BigDecimal("20"), "Reduce technology concentration with broad market exposure", new BigDecimal("245.80")));
        }

        // If too concentrated in any single sector, recommend diversification
        for (Map.Entry<String, BigDecimal> entry : sectorAllocation.entrySet()) {
            if (entry.getValue().compareTo(new BigDecimal("70")) > 0 && !entry.getKey().equals("Technology")) {
                recommendations.add(new AssetRecommendation("SPY", "SPDR S&P 500 ETF", "Diversified",
                        new BigDecimal("15"), String.format("Reduce %s concentration with broad market ETF", entry.getKey()),
                        new BigDecimal("420.50")));
                break;
            }
        }

        return recommendations.stream().limit(3).collect(Collectors.toList());
    }

    private List<String> generateInsights(Map<String, BigDecimal> sectorAllocation, int numberOfHoldings, BigDecimal diversificationScore) {
        List<String> insights = new ArrayList<>();

        // Diversification insights
        if (diversificationScore.compareTo(new BigDecimal("80")) >= 0) {
            insights.add("Excellent diversification! Your portfolio is well-balanced across multiple sectors.");
        } else if (diversificationScore.compareTo(new BigDecimal("60")) >= 0) {
            insights.add("Good diversification with room for improvement. Consider adding more sectors.");
        } else {
            insights.add("Limited diversification detected. High concentration risk in current holdings.");
        }

        // Sector concentration insights
        if (!sectorAllocation.isEmpty()) {
            String dominantSector = sectorAllocation.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("Unknown");

            BigDecimal dominantPercentage = sectorAllocation.getOrDefault(dominantSector, BigDecimal.ZERO);
            if (dominantPercentage.compareTo(new BigDecimal("40")) > 0) {
                insights.add(String.format("High concentration in %s sector (%.1f%%). Consider diversifying into other sectors.",
                        dominantSector, dominantPercentage));
            }
        }

        // Holdings count insights
        if (numberOfHoldings < 5) {
            insights.add("Consider adding more holdings to achieve better diversification and reduce individual stock risk.");
        } else if (numberOfHoldings > 20) {
            insights.add("Large number of holdings detected. Ensure you can effectively monitor all positions.");
        }

        return insights;
    }

    private String generateOverallAssessment(BigDecimal diversificationScore) {
        if (diversificationScore.compareTo(new BigDecimal("80")) >= 0) {
            return "Your portfolio demonstrates excellent diversification with well-balanced sector allocation. Continue monitoring and rebalancing as needed.";
        } else if (diversificationScore.compareTo(new BigDecimal("60")) >= 0) {
            return "Your portfolio shows good diversification fundamentals. Consider adding exposure to underrepresented sectors for optimal balance.";
        } else if (diversificationScore.compareTo(new BigDecimal("40")) >= 0) {
            return "Your portfolio has moderate diversification. Focus on reducing concentration risk and adding defensive sectors.";
        } else {
            return "Your portfolio shows limited diversification with high concentration risk. Immediate rebalancing recommended to reduce volatility.";
        }
    }
}
