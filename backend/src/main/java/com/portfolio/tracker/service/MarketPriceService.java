package com.portfolio.tracker.service;

import com.portfolio.tracker.external.AlphaVantageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class MarketPriceService {

    private static final Logger logger = LoggerFactory.getLogger(MarketPriceService.class);
    private final AlphaVantageService alphaVantageService;
    private final Map<String, BigDecimal> mockPrices = new HashMap<>();
    private final Random random = new Random();

    public MarketPriceService(AlphaVantageService alphaVantageService) {
        this.alphaVantageService = alphaVantageService;
        initializeMockPrices();
    }

    private void initializeMockPrices() {
        // Initialize with some mock prices as fallback
        mockPrices.put("AAPL", new BigDecimal("175.50"));
        mockPrices.put("GOOGL", new BigDecimal("135.25"));
        mockPrices.put("MSFT", new BigDecimal("420.75"));
        mockPrices.put("TSLA", new BigDecimal("245.80"));
        mockPrices.put("AMZN", new BigDecimal("155.90"));
        mockPrices.put("NVDA", new BigDecimal("875.25"));
        mockPrices.put("SPY", new BigDecimal("450.30"));
        mockPrices.put("QQQ", new BigDecimal("385.60"));
        mockPrices.put("VTI", new BigDecimal("245.75"));
        mockPrices.put("BTC", new BigDecimal("45000.00"));
    }

    public BigDecimal getMarketPrice(String tickerSymbol) {
        if (tickerSymbol == null || tickerSymbol.trim().isEmpty()) {
            throw new IllegalArgumentException("Ticker symbol cannot be null or empty");
        }

        String upperTicker = tickerSymbol.toUpperCase();

        // Try to get real-time price from Alpha Vantage first
        if (alphaVantageService.isApiAvailable()) {
            try {
                BigDecimal realTimePrice = alphaVantageService.getRealTimePrice(upperTicker);
                if (realTimePrice != null && realTimePrice.compareTo(BigDecimal.ZERO) > 0) {
                    logger.debug("Retrieved real-time price for {}: {}", upperTicker, realTimePrice);
                    return realTimePrice;
                }
            } catch (Exception e) {
                logger.warn("Failed to get real-time price for {} from Alpha Vantage: {}", upperTicker, e.getMessage());
            }
        }

        // Fallback to mock prices
        return getMockPrice(upperTicker);
    }

    private BigDecimal getMockPrice(String upperTicker) {
        logger.info("Using mock price for {} (Alpha Vantage unavailable or failed)", upperTicker);

        if (mockPrices.containsKey(upperTicker)) {
            // Add some realistic price fluctuation (±2%)
            BigDecimal basePrice = mockPrices.get(upperTicker);
            double fluctuation = (random.nextDouble() - 0.5) * 0.04; // ±2%
            BigDecimal priceChange = basePrice.multiply(BigDecimal.valueOf(fluctuation));
            return basePrice.add(priceChange).setScale(2, java.math.RoundingMode.HALF_UP);
        }

        // For unknown tickers, generate a random price between $10-$500
        BigDecimal randomPrice = BigDecimal.valueOf(10 + (random.nextDouble() * 490))
                .setScale(2, java.math.RoundingMode.HALF_UP);
        mockPrices.put(upperTicker, randomPrice);
        logger.info("Generated new mock price for {}: {}", upperTicker, randomPrice);
        return randomPrice;
    }

    public boolean isTickerSupported(String tickerSymbol) {
        return tickerSymbol != null && !tickerSymbol.trim().isEmpty();
    }

    public void addMockPrice(String tickerSymbol, BigDecimal price) {
        if (tickerSymbol != null && price != null) {
            mockPrices.put(tickerSymbol.toUpperCase(), price);
        }
    }

    public String getServiceStatus() {
        boolean alphaVantageAvailable = alphaVantageService.isApiAvailable();
        String cacheStats = alphaVantageService.getCacheStats();

        return String.format("Alpha Vantage API: %s, %s, Mock prices: %d symbols",
                alphaVantageAvailable ? "Available" : "Unavailable",
                cacheStats,
                mockPrices.size());
    }

    public void refreshCache() {
        alphaVantageService.clearCache();
        logger.info("Market price cache refreshed");
    }
}
