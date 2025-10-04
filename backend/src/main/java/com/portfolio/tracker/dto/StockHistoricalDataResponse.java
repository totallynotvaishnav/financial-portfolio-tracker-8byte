package com.portfolio.tracker.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for stock historical price data
 */
public class StockHistoricalDataResponse {

    private String symbol;
    private List<PricePoint> data;
    private String source;
    private Long timestamp;

    public StockHistoricalDataResponse() {
    }

    public StockHistoricalDataResponse(String symbol, List<PricePoint> data, String source) {
        this.symbol = symbol;
        this.data = data;
        this.source = source;
        this.timestamp = System.currentTimeMillis();
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public List<PricePoint> getData() {
        return data;
    }

    public void setData(List<PricePoint> data) {
        this.data = data;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    /**
     * Inner class representing a single price point in time
     */
    public static class PricePoint {

        private LocalDate date;
        private BigDecimal price;
        private BigDecimal open;
        private BigDecimal high;
        private BigDecimal low;
        private BigDecimal close;
        private Long volume;

        public PricePoint() {
        }

        public PricePoint(LocalDate date, BigDecimal close) {
            this.date = date;
            this.price = close;
            this.close = close;
        }

        public PricePoint(LocalDate date, BigDecimal open, BigDecimal high, BigDecimal low, BigDecimal close, Long volume) {
            this.date = date;
            this.open = open;
            this.high = high;
            this.low = low;
            this.close = close;
            this.price = close; // price defaults to close
            this.volume = volume;
        }

        public LocalDate getDate() {
            return date;
        }

        public void setDate(LocalDate date) {
            this.date = date;
        }

        public BigDecimal getPrice() {
            return price;
        }

        public void setPrice(BigDecimal price) {
            this.price = price;
        }

        public BigDecimal getOpen() {
            return open;
        }

        public void setOpen(BigDecimal open) {
            this.open = open;
        }

        public BigDecimal getHigh() {
            return high;
        }

        public void setHigh(BigDecimal high) {
            this.high = high;
        }

        public BigDecimal getLow() {
            return low;
        }

        public void setLow(BigDecimal low) {
            this.low = low;
        }

        public BigDecimal getClose() {
            return close;
        }

        public void setClose(BigDecimal close) {
            this.close = close;
        }

        public Long getVolume() {
            return volume;
        }

        public void setVolume(Long volume) {
            this.volume = volume;
        }
    }
}
