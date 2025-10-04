package com.portfolio.tracker.controller;

import com.portfolio.tracker.dto.StockHistoricalDataResponse;
import com.portfolio.tracker.external.AlphaVantageService;
import com.portfolio.tracker.service.MarketPriceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/stocks")
public class StockController {

    private final MarketPriceService marketPriceService;
    private final AlphaVantageService alphaVantageService;

    public StockController(MarketPriceService marketPriceService, AlphaVantageService alphaVantageService) {
        this.marketPriceService = marketPriceService;
        this.alphaVantageService = alphaVantageService;
    }

    @GetMapping("/{symbol}/price")
    public ResponseEntity<Map<String, Object>> getStockPrice(@PathVariable String symbol) {
        try {
            BigDecimal price = marketPriceService.getMarketPrice(symbol);

            Map<String, Object> response = new HashMap<>();
            response.put("symbol", symbol.toUpperCase());
            response.put("price", price);
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid symbol");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch price");
            errorResponse.put("message", "Unable to retrieve price data");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/market/status")
    public ResponseEntity<Map<String, Object>> getMarketServiceStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "operational");
        status.put("serviceInfo", marketPriceService.getServiceStatus());
        status.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(status);
    }

    @PostMapping("/market/refresh-cache")
    public ResponseEntity<Map<String, Object>> refreshMarketPriceCache() {
        try {
            marketPriceService.refreshCache();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cache refreshed successfully");
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to refresh cache");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{symbol}/history")
    public ResponseEntity<?> getStockHistory(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "30") int days) {
        try {
            if (days < 1 || days > 365) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid days parameter");
                errorResponse.put("message", "Days must be between 1 and 365");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Check if Alpha Vantage API is available
            if (!alphaVantageService.isApiAvailable()) {
                // Generate mock data if API is not available
                StockHistoricalDataResponse mockResponse = generateMockHistoricalData(symbol, days);
                return ResponseEntity.ok(mockResponse);
            }

            // Fetch real historical data from Alpha Vantage
            Map<LocalDate, AlphaVantageService.HistoricalPrice> historicalData
                    = alphaVantageService.getHistoricalData(symbol, days);

            if (historicalData.isEmpty()) {
                // Fallback to mock data if no data retrieved
                StockHistoricalDataResponse mockResponse = generateMockHistoricalData(symbol, days);
                return ResponseEntity.ok(mockResponse);
            }

            // Convert to response DTO
            List<StockHistoricalDataResponse.PricePoint> pricePoints = historicalData.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(entry -> new StockHistoricalDataResponse.PricePoint(
                    entry.getKey(),
                    entry.getValue().getOpen(),
                    entry.getValue().getHigh(),
                    entry.getValue().getLow(),
                    entry.getValue().getClose(),
                    entry.getValue().getVolume()
            ))
                    .collect(Collectors.toList());

            StockHistoricalDataResponse response = new StockHistoricalDataResponse(
                    symbol.toUpperCase(),
                    pricePoints,
                    "Alpha Vantage"
            );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid symbol");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch historical data");
            errorResponse.put("message", "Unable to retrieve historical data");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Generate mock historical data as fallback
     */
    private StockHistoricalDataResponse generateMockHistoricalData(String symbol, int days) {
        List<StockHistoricalDataResponse.PricePoint> mockData = new ArrayList<>();

        // Get current price as baseline
        BigDecimal currentPrice;
        try {
            currentPrice = marketPriceService.getMarketPrice(symbol);
        } catch (Exception e) {
            currentPrice = new BigDecimal("100.00");
        }

        Random random = new Random();
        LocalDate startDate = LocalDate.now().minusDays(days - 1);

        for (int i = 0; i < days; i++) {
            LocalDate date = startDate.plusDays(i);

            // Generate realistic price variation (±2% daily)
            double variation = (random.nextDouble() - 0.5) * 0.04;
            double progressFactor = (double) i / days;
            BigDecimal basePrice = currentPrice.multiply(BigDecimal.valueOf(0.8 + (0.2 * progressFactor)));
            BigDecimal dayPrice = basePrice.multiply(BigDecimal.valueOf(1 + variation));

            // Generate OHLC data
            BigDecimal open = dayPrice.multiply(BigDecimal.valueOf(0.995 + (random.nextDouble() * 0.01)));
            BigDecimal close = dayPrice;
            BigDecimal high = dayPrice.multiply(BigDecimal.valueOf(1.005 + (random.nextDouble() * 0.01)));
            BigDecimal low = dayPrice.multiply(BigDecimal.valueOf(0.995 - (random.nextDouble() * 0.01)));
            long volume = (long) (1000000 + (random.nextDouble() * 5000000));

            mockData.add(new StockHistoricalDataResponse.PricePoint(
                    date,
                    open.setScale(2, BigDecimal.ROUND_HALF_UP),
                    high.setScale(2, BigDecimal.ROUND_HALF_UP),
                    low.setScale(2, BigDecimal.ROUND_HALF_UP),
                    close.setScale(2, BigDecimal.ROUND_HALF_UP),
                    volume
            ));
        }

        return new StockHistoricalDataResponse(
                symbol.toUpperCase(),
                mockData,
                "Mock Data (Alpha Vantage unavailable)"
        );
    }
}
