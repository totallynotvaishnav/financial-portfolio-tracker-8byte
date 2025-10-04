# Portfolio Management API Documentation

## Overview

RESTful API for managing investment portfolios with real-time market data integration.

## Base URL

```
http://localhost:8000/api
```

## Authentication

Currently assumes user authentication is handled externally. All endpoints require a valid `userId` parameter.

---

## API Endpoints

### 1. Create a New Portfolio

**Endpoint:** `POST /portfolios`

**Description:** Creates a new investment portfolio for a user.

**Request Body:**

```json
{
    "name": "My Tech Portfolio",
    "userId": 1
}
```

**Response:** `201 Created`

```json
{
    "id": 1,
    "name": "My Tech Portfolio",
    "userId": 1,
    "createdAt": "2025-10-02T12:00:00",
    "totalValue": 0.0,
    "totalCost": 0.0,
    "totalGainLoss": 0.0,
    "totalGainLossPercentage": 0.0,
    "assets": []
}
```

**Error Responses:**

```json
// 404 - User not found
{
  "status": 404,
  "error": "Resource Not Found",
  "message": "User not found with id: 1",
  "timestamp": "2025-10-02T12:00:00"
}

// 409 - Duplicate portfolio name
{
  "status": 409,
  "error": "Duplicate Resource",
  "message": "Portfolio with name 'My Tech Portfolio' already exists for this user",
  "timestamp": "2025-10-02T12:00:00"
}
```

---

### 2. Get User's Portfolios

**Endpoint:** `GET /portfolios/user/{userId}`

**Description:** Retrieves all portfolios for a specific user with current market values.

**Response:** `200 OK`

```json
[
    {
        "id": 1,
        "name": "My Tech Portfolio",
        "userId": 1,
        "createdAt": "2025-10-02T12:00:00",
        "totalValue": 52750.0,
        "totalCost": 50000.0,
        "totalGainLoss": 2750.0,
        "totalGainLossPercentage": 5.5,
        "assets": [
            {
                "id": 1,
                "tickerSymbol": "AAPL",
                "quantity": 100.0,
                "averagePrice": 150.0,
                "currentMarketPrice": 175.5,
                "currentMarketValue": 17550.0,
                "gainLoss": 2550.0,
                "gainLossPercentage": 17.0,
                "createdAt": "2025-10-02T12:00:00",
                "updatedAt": "2025-10-02T12:00:00"
            },
            {
                "id": 2,
                "tickerSymbol": "GOOGL",
                "quantity": 50.0,
                "averagePrice": 130.0,
                "currentMarketPrice": 135.25,
                "currentMarketValue": 6762.5,
                "gainLoss": 262.5,
                "gainLossPercentage": 4.04,
                "createdAt": "2025-10-02T12:00:00",
                "updatedAt": "2025-10-02T12:00:00"
            }
        ]
    }
]
```

---

### 3. Get Portfolio Details

**Endpoint:** `GET /portfolios/{portfolioId}/user/{userId}`

**Description:** Retrieves complete details of a specific portfolio with current market values.

**Response:** `200 OK`

```json
{
    "id": 1,
    "name": "My Tech Portfolio",
    "userId": 1,
    "createdAt": "2025-10-02T12:00:00",
    "totalValue": 52750.0,
    "totalCost": 50000.0,
    "totalGainLoss": 2750.0,
    "totalGainLossPercentage": 5.5,
    "assets": [
        {
            "id": 1,
            "tickerSymbol": "AAPL",
            "quantity": 100.0,
            "averagePrice": 150.0,
            "currentMarketPrice": 175.5,
            "currentMarketValue": 17550.0,
            "gainLoss": 2550.0,
            "gainLossPercentage": 17.0,
            "createdAt": "2025-10-02T12:00:00",
            "updatedAt": "2025-10-02T12:00:00"
        }
    ]
}
```

**Error Response:**

```json
// 404 - Portfolio not found
{
    "status": 404,
    "error": "Resource Not Found",
    "message": "Portfolio not found with id: 1",
    "timestamp": "2025-10-02T12:00:00"
}
```

---

### 4. Add Asset to Portfolio

**Endpoint:** `POST /portfolios/{portfolioId}/user/{userId}/assets`

**Description:** Adds a new asset (stock) to an existing portfolio.

**Request Body:**

```json
{
    "tickerSymbol": "AAPL",
    "quantity": 100.0,
    "averagePrice": 150.5
}
```

**Response:** `201 Created`

```json
{
    "id": 1,
    "tickerSymbol": "AAPL",
    "quantity": 100.0,
    "averagePrice": 150.5,
    "currentMarketPrice": 175.5,
    "currentMarketValue": 17550.0,
    "gainLoss": 2500.0,
    "gainLossPercentage": 16.61,
    "createdAt": "2025-10-02T12:00:00",
    "updatedAt": "2025-10-02T12:00:00"
}
```

**Error Responses:**

```json
// 404 - Portfolio not found
{
  "status": 404,
  "error": "Resource Not Found",
  "message": "Portfolio not found with id: 1",
  "timestamp": "2025-10-02T12:00:00"
}

// 409 - Asset already exists
{
  "status": 409,
  "error": "Duplicate Resource",
  "message": "Asset AAPL already exists in this portfolio",
  "timestamp": "2025-10-02T12:00:00"
}

// 400 - Invalid ticker symbol
{
  "status": 400,
  "error": "Invalid Input",
  "message": "Invalid ticker symbol: INVALID",
  "timestamp": "2025-10-02T12:00:00"
}

// 400 - Validation error
{
  "status": 400,
  "error": "Validation Failed",
  "message": "Invalid input data",
  "fieldErrors": {
    "tickerSymbol": "Ticker symbol is required",
    "quantity": "Quantity must be positive",
    "averagePrice": "Average price must be positive"
  },
  "timestamp": "2025-10-02T12:00:00"
}
```

---

### 5. Update Asset in Portfolio

**Endpoint:** `PUT /portfolios/{portfolioId}/user/{userId}/assets/{tickerSymbol}`

**Description:** Updates the quantity and/or average price of an existing asset in a portfolio.

**Request Body:**

```json
{
    "tickerSymbol": "AAPL",
    "quantity": 150.0,
    "averagePrice": 145.75
}
```

**Response:** `200 OK`

```json
{
    "id": 1,
    "tickerSymbol": "AAPL",
    "quantity": 150.0,
    "averagePrice": 145.75,
    "currentMarketPrice": 175.5,
    "currentMarketValue": 26325.0,
    "gainLoss": 4462.5,
    "gainLossPercentage": 20.42,
    "createdAt": "2025-10-02T12:00:00",
    "updatedAt": "2025-10-02T12:05:00"
}
```

**Error Response:**

```json
// 404 - Asset not found
{
    "status": 404,
    "error": "Resource Not Found",
    "message": "Asset AAPL not found in portfolio",
    "timestamp": "2025-10-02T12:00:00"
}
```

---

### 6. Remove Asset from Portfolio

**Endpoint:** `DELETE /portfolios/{portfolioId}/user/{userId}/assets/{tickerSymbol}`

**Description:** Removes an asset completely from a portfolio.

**Response:** `204 No Content`

**Error Response:**

```json
// 404 - Asset not found
{
    "status": 404,
    "error": "Resource Not Found",
    "message": "Asset AAPL not found in portfolio",
    "timestamp": "2025-10-02T12:00:00"
}
```

---

### 7. Delete Portfolio

**Endpoint:** `DELETE /portfolios/{portfolioId}/user/{userId}`

**Description:** Deletes an entire portfolio and all its assets.

**Response:** `204 No Content`

**Error Response:**

```json
// 404 - Portfolio not found
{
    "status": 404,
    "error": "Resource Not Found",
    "message": "Portfolio not found with id: 1",
    "timestamp": "2025-10-02T12:00:00"
}
```

---

### 8. Get Real-Time Stock Price

**Endpoint:** `GET /stocks/{symbol}/price`

**Description:** Fetches real-time stock price using Alpha Vantage API with fallback to mock data.

**Response:** `200 OK`

```json
{
    "symbol": "AAPL",
    "price": 255.45,
    "timestamp": 1759418586950
}
```

**Error Response:**

```json
// 400 - Invalid symbol
{
    "error": "Invalid symbol",
    "message": "Ticker symbol cannot be null or empty"
}

// 500 - Service error
{
    "error": "Failed to fetch price",
    "message": "Unable to retrieve price data"
}
```

---

### 9. Get Market Service Status

**Endpoint:** `GET /stocks/market/status`

**Description:** Returns the status of the market data service and Alpha Vantage API integration.

**Response:** `200 OK`

```json
{
    "status": "operational",
    "serviceInfo": "Alpha Vantage API: Available, Cache: 2 total entries, 2 fresh entries, Mock prices: 10 symbols",
    "timestamp": 1759418595828
}
```

---

### 10. Refresh Market Price Cache

**Endpoint:** `POST /stocks/market/refresh-cache`

**Description:** Clears the Alpha Vantage price cache to force fresh data on next requests.

**Response:** `200 OK`

```json
{
    "message": "Cache refreshed successfully",
    "timestamp": 1759418611939
}
```

---

## Market Price Integration

The API now features **live Alpha Vantage integration** for real-time stock prices:

### Alpha Vantage Integration Features

-   ✅ **Real-time Stock Prices** - Live data from Alpha Vantage Global Quote API
-   ✅ **Intelligent Caching** - 15-minute cache to respect API rate limits
-   ✅ **Graceful Fallback** - Automatic fallback to mock data when API unavailable
-   ✅ **Rate Limit Handling** - Proper handling of Alpha Vantage rate limits
-   ✅ **Error Recovery** - Network error handling with cached data fallback
-   ✅ **Cache Management** - Manual cache refresh capabilities
-   ✅ **Service Monitoring** - Status endpoint for monitoring API health

### API Configuration

```properties
# Alpha Vantage API Configuration
alphavantage.api.key=U4A82CR3D6GHC9LX
alphavantage.api.base-url=https://www.alphavantage.co/query
```

### Supported Features

-   **Real-time Quotes**: Uses Alpha Vantage Global Quote function
-   **Cache TTL**: 15 minutes to balance freshness and rate limits
-   **Rate Limit**: Respects Alpha Vantage's 5 calls per minute limit
-   **Fallback Data**: Mock prices for 10+ popular stocks when API unavailable

### Usage Examples

```bash
# Get real-time AAPL price
curl -X GET "http://localhost:8000/api/stocks/AAPL/price"

# Check service status
curl -X GET "http://localhost:8000/api/stocks/market/status"

# Refresh cache
curl -X POST "http://localhost:8000/api/stocks/market/refresh-cache"
```

### Supported Tickers (Mock Data)

-   **AAPL** - Apple Inc. (~$175.50)
-   **GOOGL** - Alphabet Inc. (~$135.25)
-   **MSFT** - Microsoft Corp. (~$420.75)
-   **TSLA** - Tesla Inc. (~$245.80)
-   **AMZN** - Amazon.com (~$155.90)
-   **NVDA** - NVIDIA Corp. (~$875.25)
-   **SPY** - SPDR S&P 500 ETF (~$450.30)
-   **QQQ** - Invesco QQQ Trust (~$385.60)
-   **VTI** - Vanguard Total Stock Market ETF (~$245.75)
-   **BTC** - Bitcoin (~$45,000.00)

### Price Simulation

-   Prices include realistic ±2% fluctuation
-   Unknown tickers get random prices between $10-$500
-   Prices are cached and updated with each request

---

## Testing with cURL

### Create Portfolio

```bash
curl -X POST http://localhost:8000/api/portfolios \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Tech Portfolio",
    "userId": 1
  }'
```

### Add Asset

```bash
curl -X POST http://localhost:8000/api/portfolios/1/user/1/assets \
  -H "Content-Type: application/json" \
  -d '{
    "tickerSymbol": "AAPL",
    "quantity": 100.0,
    "averagePrice": 150.50
  }'
```

### Get Portfolio Details

```bash
curl -X GET http://localhost:8000/api/portfolios/1/user/1
```

### Update Asset

```bash
curl -X PUT http://localhost:8000/api/portfolios/1/user/1/assets/AAPL \
  -H "Content-Type: application/json" \
  -d '{
    "tickerSymbol": "AAPL",
    "quantity": 150.0,
    "averagePrice": 145.75
  }'
```

### Remove Asset

```bash
curl -X DELETE http://localhost:8000/api/portfolios/1/user/1/assets/AAPL
```

### Get AI-Driven Portfolio Insights

```bash
curl -X GET http://localhost:8000/api/ai-insights/portfolio/1/diversification
```

---

## AI Insights API

### Get Portfolio Diversification Insights

**Endpoint:** `GET /ai-insights/portfolio/{portfolioId}/diversification`

**Description:** Provides AI-driven analysis of portfolio diversification, risk assessment, and asset recommendations.

**Path Parameters:**

-   `portfolioId`: Long - ID of the portfolio to analyze

**Response:** `200 OK`

```json
{
    "portfolioId": 1,
    "portfolioName": "My Tech Portfolio",
    "diversificationScore": 65.5,
    "riskLevel": "MODERATE",
    "sectorAllocation": {
        "Technology": 75.0,
        "Healthcare": 15.0,
        "Financial Services": 10.0
    },
    "recommendations": [
        {
            "tickerSymbol": "PG",
            "companyName": "Procter & Gamble",
            "sector": "Consumer Staples",
            "suggestedAllocation": 8.0,
            "rationale": "Consumer staples provide stability during market downturns",
            "estimatedPrice": 142.3
        }
    ],
    "insights": [
        "Good diversification with room for improvement. Consider adding more sectors.",
        "High concentration in Technology sector (75.0%). Consider diversifying into other sectors."
    ],
    "overallAssessment": "Your portfolio shows good diversification fundamentals. Consider adding exposure to underrepresented sectors for optimal balance."
}
```

**Features:**

-   **Diversification Score**: 0-100 scale based on sector distribution and number of assets
-   **Risk Assessment**: Categorizes portfolio risk as LOW, MODERATE, or HIGH
-   **Sector Analysis**: Breakdown of portfolio allocation across different sectors
-   **AI Recommendations**: Suggested assets to improve diversification
-   **Intelligent Insights**: AI-generated observations about portfolio composition
-   **Overall Assessment**: Comprehensive evaluation with actionable advice

**Sector Coverage:**

-   Technology
-   Healthcare
-   Financial Services
-   Consumer Discretionary
-   Consumer Staples
-   Other

---

## Entity Models

### Portfolio

-   `id`: Long - Primary key
-   `name`: String - Portfolio name
-   `userId`: Long - Reference to user
-   `createdAt`: LocalDateTime - Creation timestamp
-   `assets`: List<Asset> - Associated assets

### Asset

-   `id`: Long - Primary key
-   `tickerSymbol`: String - Stock ticker (e.g., "AAPL")
-   `quantity`: BigDecimal - Number of shares owned
-   `averagePrice`: BigDecimal - Average purchase price per share
-   `createdAt`: LocalDateTime - Creation timestamp
-   `updatedAt`: LocalDateTime - Last update timestamp
-   `portfolio`: Portfolio - Parent portfolio reference

---

## Features

✅ **Complete CRUD Operations** - Create, read, update, delete portfolios and assets  
✅ **Real-time Market Data** - Current market prices and calculated gains/losses  
✅ **AI-Driven Portfolio Insights** - Diversification analysis, risk assessment, and intelligent recommendations  
✅ **Smart Asset Recommendations** - AI-powered suggestions to optimize portfolio balance  
✅ **Input Validation** - Comprehensive validation with detailed error messages  
✅ **Error Handling** - Global exception handling with proper HTTP status codes  
✅ **Portfolio Analytics** - Automatic calculation of total values and performance metrics  
✅ **RESTful Design** - Follows REST conventions with proper HTTP methods and status codes  
✅ **JSON Request/Response** - Clean JSON API with well-structured DTOs

---

## Best Practices Implemented

-   **Clean Architecture** - Separation of controllers, services, and repositories
-   **DTO Pattern** - Request/Response DTOs separate from entities
-   **Global Exception Handling** - Centralized error handling with consistent responses
-   **Input Validation** - Bean validation with custom error messages
-   **Transaction Management** - Proper transaction boundaries in service layer
-   **CORS Support** - Configured for frontend integration
