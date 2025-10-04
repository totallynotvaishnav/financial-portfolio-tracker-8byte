package com.portfolio.tracker.external;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Service for fetching real-time and historical stock data from Alpha Vantage
 * API Includes caching, rate limiting protection, and graceful fallback
 * handling
 */
@Service
public class AlphaVantageService {

    private static final Logger logger = LoggerFactory.getLogger(AlphaVantageService.class);

    @Value("${alphavantage.api.key}")
    private String apiKey;

    @Value("${alphavantage.api.base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate;

    // Simple in-memory cache to avoid hitting API limits
    private final ConcurrentHashMap<String, CachedPrice> priceCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, CachedHistoricalData> historicalCache = new ConcurrentHashMap<>();

    // Cache TTL in minutes
    private static final long CACHE_TTL_MINUTES = 15;
    private static final long HISTORICAL_CACHE_TTL_HOURS = 24; // Historical data changes less frequently

    private final ObjectMapper objectMapper = new ObjectMapper();

    public AlphaVantageService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Fetch real-time stock price using Global Quote API
     *
     * @param symbol Stock ticker symbol (e.g., "AAPL")
     * @return Current stock price, or null if unable to fetch
     */
    public BigDecimal getRealTimePrice(String symbol) {
        if (symbol == null || symbol.trim().isEmpty()) {
            logger.warn("Invalid symbol provided: {}", symbol);
            return null;
        }

        String upperSymbol = symbol.toUpperCase().trim();

        // Check cache first
        CachedPrice cachedPrice = priceCache.get(upperSymbol);
        if (cachedPrice != null && !cachedPrice.isExpired()) {
            logger.debug("Returning cached price for {}: {}", upperSymbol, cachedPrice.getPrice());
            return cachedPrice.getPrice();
        }

        try {
            // Build URL for Global Quote API
            String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                    .queryParam("function", "GLOBAL_QUOTE")
                    .queryParam("symbol", upperSymbol)
                    .queryParam("apikey", apiKey)
                    .toUriString();

            logger.info("Fetching real-time price for {} from Alpha Vantage", upperSymbol);
            logger.debug("API URL: {}", url.replace(apiKey, "***"));

            AlphaVantageResponse response = restTemplate.getForObject(url, AlphaVantageResponse.class);

            if (response == null) {
                logger.error("Null response from Alpha Vantage API for symbol: {}", upperSymbol);
                return null;
            }

            // Check for API errors
            if (response.getErrorMessage() != null) {
                logger.error("Alpha Vantage API error for {}: {}", upperSymbol, response.getErrorMessage());
                return null;
            }

            // Check for rate limit note
            if (response.getNote() != null && response.getNote().contains("call frequency")) {
                logger.warn("Alpha Vantage rate limit reached: {}", response.getNote());
                return getCachedPriceOrNull(upperSymbol);
            }

            // Extract price from Global Quote
            if (response.getGlobalQuote() != null && response.getGlobalQuote().getPrice() != null) {
                String priceStr = response.getGlobalQuote().getPrice();
                try {
                    BigDecimal price = new BigDecimal(priceStr);

                    // Cache the result
                    priceCache.put(upperSymbol, new CachedPrice(price, LocalDateTime.now()));

                    logger.info("Successfully fetched price for {}: {}", upperSymbol, price);
                    return price;
                } catch (NumberFormatException e) {
                    logger.error("Invalid price format from API for {}: {}", upperSymbol, priceStr);
                    return null;
                }
            } else {
                logger.warn("No price data in Global Quote response for symbol: {}", upperSymbol);
                return null;
            }

        } catch (ResourceAccessException e) {
            logger.error("Network error accessing Alpha Vantage API for {}: {}", upperSymbol, e.getMessage());
            return getCachedPriceOrNull(upperSymbol);
        } catch (Exception e) {
            logger.error("Unexpected error fetching price for {} from Alpha Vantage: {}", upperSymbol, e.getMessage(), e);
            return getCachedPriceOrNull(upperSymbol);
        }
    }

    /**
     * Check if Alpha Vantage API is available and properly configured
     *
     * @return true if API key is configured, false otherwise
     */
    public boolean isApiAvailable() {
        return apiKey != null && !apiKey.trim().isEmpty() && !apiKey.equals("YOUR_API_KEY");
    }

    /**
     * Get cached price if available, even if expired Used as fallback when API
     * is unavailable
     */
    private BigDecimal getCachedPriceOrNull(String symbol) {
        CachedPrice cached = priceCache.get(symbol);
        if (cached != null) {
            logger.info("Returning stale cached price for {} as fallback: {}", symbol, cached.getPrice());
            return cached.getPrice();
        }
        return null;
    }

    /**
     * Clear the price cache (useful for testing or manual refresh)
     */
    public void clearCache() {
        priceCache.clear();
        historicalCache.clear();
        logger.info("Price and historical caches cleared");
    }

    /**
     * Get cache statistics for monitoring
     */
    public String getCacheStats() {
        int totalEntries = priceCache.size();
        long freshEntries = priceCache.values().stream()
                .mapToLong(cached -> cached.isExpired() ? 0 : 1)
                .sum();
        int historicalEntries = historicalCache.size();

        return String.format("Cache: %d total entries, %d fresh entries, %d historical entries",
                totalEntries, freshEntries, historicalEntries);
    }

    /**
     * Fetch historical stock data for the last N days
     *
     * @param symbol Stock ticker symbol
     * @param days Number of days of historical data to fetch (max 100 for daily
     * compact)
     * @return Map of date to price data, or empty map if unable to fetch
     */
    public Map<LocalDate, HistoricalPrice> getHistoricalData(String symbol, int days) {
        if (symbol == null || symbol.trim().isEmpty()) {
            logger.warn("Invalid symbol provided for historical data: {}", symbol);
            return Collections.emptyMap();
        }

        String upperSymbol = symbol.toUpperCase().trim();
        String cacheKey = upperSymbol + "_" + days;

        // Check cache first
        CachedHistoricalData cached = historicalCache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            logger.debug("Returning cached historical data for {}", upperSymbol);
            return cached.getData();
        }

        try {
            // Build URL for Time Series Daily API
            String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                    .queryParam("function", "TIME_SERIES_DAILY")
                    .queryParam("symbol", upperSymbol)
                    .queryParam("outputsize", days > 100 ? "full" : "compact")
                    .queryParam("apikey", apiKey)
                    .toUriString();

            logger.info("Fetching historical data for {} from Alpha Vantage", upperSymbol);
            logger.debug("API URL: {}", url.replace(apiKey, "***"));

            AlphaVantageResponse response = restTemplate.getForObject(url, AlphaVantageResponse.class);

            if (response == null) {
                logger.error("Null response from Alpha Vantage API for historical data: {}", upperSymbol);
                return getCachedHistoricalDataOrEmpty(cacheKey);
            }

            // Check for API errors
            if (response.getErrorMessage() != null) {
                logger.error("Alpha Vantage API error for {}: {}", upperSymbol, response.getErrorMessage());
                return getCachedHistoricalDataOrEmpty(cacheKey);
            }

            // Check for rate limit note
            if (response.getNote() != null && response.getNote().contains("call frequency")) {
                logger.warn("Alpha Vantage rate limit reached: {}", response.getNote());
                return getCachedHistoricalDataOrEmpty(cacheKey);
            }

            // Parse time series data
            if (response.getTimeSeriesDaily() != null) {
                Map<LocalDate, HistoricalPrice> historicalData = parseTimeSeriesData(response.getTimeSeriesDaily(), days);

                if (!historicalData.isEmpty()) {
                    // Cache the result
                    historicalCache.put(cacheKey, new CachedHistoricalData(historicalData, LocalDateTime.now()));
                    logger.info("Successfully fetched {} days of historical data for {}", historicalData.size(), upperSymbol);
                    return historicalData;
                } else {
                    logger.warn("No historical data parsed for symbol: {}", upperSymbol);
                    return Collections.emptyMap();
                }
            } else {
                logger.warn("No time series data in response for symbol: {}", upperSymbol);
                return getCachedHistoricalDataOrEmpty(cacheKey);
            }

        } catch (ResourceAccessException e) {
            logger.error("Network error accessing Alpha Vantage API for {}: {}", upperSymbol, e.getMessage());
            return getCachedHistoricalDataOrEmpty(cacheKey);
        } catch (Exception e) {
            logger.error("Unexpected error fetching historical data for {} from Alpha Vantage: {}",
                    upperSymbol, e.getMessage(), e);
            return getCachedHistoricalDataOrEmpty(cacheKey);
        }
    }

    /**
     * Parse the time series data from Alpha Vantage response
     */
    @SuppressWarnings("unchecked")
    private Map<LocalDate, HistoricalPrice> parseTimeSeriesData(Object timeSeriesDaily, int maxDays) {
        Map<LocalDate, HistoricalPrice> result = new HashMap<>();

        try {
            if (timeSeriesDaily instanceof Map) {
                Map<String, Object> timeSeriesMap = (Map<String, Object>) timeSeriesDaily;
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

                // Sort dates in descending order and limit to maxDays
                List<String> sortedDates = timeSeriesMap.keySet().stream()
                        .sorted(Comparator.reverseOrder())
                        .limit(maxDays)
                        .collect(Collectors.toList());

                for (String dateStr : sortedDates) {
                    try {
                        LocalDate date = LocalDate.parse(dateStr, formatter);
                        Object dailyDataObj = timeSeriesMap.get(dateStr);

                        if (dailyDataObj instanceof Map) {
                            Map<String, String> dailyData = (Map<String, String>) dailyDataObj;

                            String openStr = dailyData.get("1. open");
                            String highStr = dailyData.get("2. high");
                            String lowStr = dailyData.get("3. low");
                            String closeStr = dailyData.get("4. close");
                            String volumeStr = dailyData.get("5. volume");

                            if (closeStr != null) {
                                HistoricalPrice price = new HistoricalPrice(
                                        parseBigDecimal(openStr),
                                        parseBigDecimal(highStr),
                                        parseBigDecimal(lowStr),
                                        parseBigDecimal(closeStr),
                                        parseLong(volumeStr)
                                );

                                result.put(date, price);
                            }
                        }
                    } catch (Exception e) {
                        logger.warn("Error parsing date {}: {}", dateStr, e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error parsing time series data: {}", e.getMessage(), e);
        }

        return result;
    }

    private BigDecimal parseBigDecimal(String value) {
        if (value == null || value.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }
        try {
            return new BigDecimal(value);
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    private Long parseLong(String value) {
        if (value == null || value.trim().isEmpty()) {
            return 0L;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            return 0L;
        }
    }

    private Map<LocalDate, HistoricalPrice> getCachedHistoricalDataOrEmpty(String cacheKey) {
        CachedHistoricalData cached = historicalCache.get(cacheKey);
        if (cached != null) {
            logger.info("Returning stale cached historical data as fallback");
            return cached.getData();
        }
        return Collections.emptyMap();
    }

    /**
     * Internal class for caching prices with expiration
     */
    public static class CachedPrice {

        private final BigDecimal price;
        private final LocalDateTime timestamp;

        public CachedPrice(BigDecimal price, LocalDateTime timestamp) {
            this.price = price;
            this.timestamp = timestamp;
        }

        public BigDecimal getPrice() {
            return price;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public boolean isExpired() {
            return LocalDateTime.now().isAfter(timestamp.plusMinutes(CACHE_TTL_MINUTES));
        }
    }

    /**
     * Internal class for caching historical data with expiration
     */
    public static class CachedHistoricalData {

        private final Map<LocalDate, HistoricalPrice> data;
        private final LocalDateTime timestamp;

        public CachedHistoricalData(Map<LocalDate, HistoricalPrice> data, LocalDateTime timestamp) {
            this.data = data;
            this.timestamp = timestamp;
        }

        public Map<LocalDate, HistoricalPrice> getData() {
            return data;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public boolean isExpired() {
            return LocalDateTime.now().isAfter(timestamp.plusHours(HISTORICAL_CACHE_TTL_HOURS));
        }
    }

    /**
     * Class representing a historical price data point
     */
    public static class HistoricalPrice {

        private final BigDecimal open;
        private final BigDecimal high;
        private final BigDecimal low;
        private final BigDecimal close;
        private final Long volume;

        public HistoricalPrice(BigDecimal open, BigDecimal high, BigDecimal low, BigDecimal close, Long volume) {
            this.open = open;
            this.high = high;
            this.low = low;
            this.close = close;
            this.volume = volume;
        }

        public BigDecimal getOpen() {
            return open;
        }

        public BigDecimal getHigh() {
            return high;
        }

        public BigDecimal getLow() {
            return low;
        }

        public BigDecimal getClose() {
            return close;
        }

        public Long getVolume() {
            return volume;
        }
    }
}
