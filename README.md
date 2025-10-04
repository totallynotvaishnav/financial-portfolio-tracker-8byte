# Financial Portfolio Tracker

A secure, production-ready full-stack financial portfolio management application.

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.java.net/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)

## 🎯 Overview

Comprehensive portfolio management system with real-time market data, performance analytics, and AI-driven investment insights.

**Key Features:**

-   📊 Multi-portfolio tracking with real-time valuation
-   💹 Live stock prices via Alpha Vantage API
-   🤖 AI-powered diversification analysis & recommendations
-   📈 Historical data, gain/loss tracking, sector allocation
-   🔐 JWT authentication with refresh tokens
-   📱 Responsive React dashboard with Chart.js visualizations

**Tech Stack:** Java 21, Spring Boot 3.5, React 18, TypeScript, PostgreSQL 16, Docker

## 🚀 Quick Start

### Prerequisites

-   Java 21+, Node.js 20+, Docker & Docker Compose
-   Alpha Vantage API key (free at [alphavantage.co](https://www.alphavantage.co/))

### Option 1: Full Stack with Docker (Recommended)

```bash
# Start all services
docker-compose up --build

# Access at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api
```

### Option 2: Local Development

```bash
# Terminal 1 - Backend
cd backend
cp .env.example .env  # Add your API key
./mvnw spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

**First time?** Register at http://localhost:3000, create a portfolio, and start tracking!

## 📋 API Quick Reference

Base URL: `http://localhost:8000/api`

### Authentication

```bash
# Register
POST /auth/register
{ "username": "user", "email": "user@example.com", "password": "pass", "firstName": "John", "lastName": "Doe" }

# Login (returns JWT token)
POST /auth/login
{ "username": "user", "password": "pass" }
```

### Portfolios

```bash
# Create portfolio
POST /portfolios (Auth required)
{ "name": "Tech Growth", "userId": 1 }

# Get user portfolios
GET /portfolios/user/{userId} (Auth required)

# Add asset
POST /portfolios/{id}/user/{userId}/assets
{ "tickerSymbol": "AAPL", "quantity": 100, "averagePrice": 150.50 }
```

### AI Insights

```bash
# Get diversification analysis (Auth required)
GET /ai-insights/portfolio/{portfolioId}/diversification
# Returns: diversification score, risk level, sector allocation, smart recommendations
```

### Market Data

```bash
# Get stock price
GET /stocks/{symbol}/price

# Historical data
GET /stocks/{symbol}/historical?startDate=2024-01-01&endDate=2024-12-31

# Search stocks
GET /stocks/search?query=apple
```

## 🔥 Production Deployment

### Pre-Deployment Checklist

```bash
# 1. Generate secrets
./generate-secrets.sh

# 2. Configure environment (.env file)
DB_PASSWORD=<strong-password>
JWT_SECRET=<256-bit-key>
ALPHAVANTAGE_API_KEY=<your-key>
ALLOWED_ORIGINS=https://yourdomain.com
SPRING_PROFILES_ACTIVE=prod

# 3. Deploy
docker-compose -f docker-compose.prod.yml up -d

# 4. Health check
./health-check.sh
```

### Security Checklist

-   ✅ Strong JWT secret (256+ bits)
-   ✅ Secure database password
-   ✅ CORS with specific origins (no wildcards)
-   ✅ HTTPS/SSL enabled
-   ✅ No hardcoded secrets
-   ✅ Firewall rules configured
-   ✅ Automated database backups

## 🛡️ Security Features

**Authentication & Authorization:**
JWT tokens with refresh mechanism • BCrypt password hashing • Token blacklisting on logout • Role-based access control • Stateless sessions

**API Security:**
Environment-based CORS • SQL injection protection (JPA/Hibernate) • Input validation • XSS protection headers • Secure error handling (no stack traces in prod)

**Infrastructure:**  
Non-root Docker containers • Multi-stage builds • Connection pooling (HikariCP) • Health check endpoints • Separate dev/prod profiles

## 🤖 AI Insights Feature

Analyzes portfolios using **Herfindahl-Hirschman Index** for diversification scoring (0-100 scale).

**Risk Assessment:**

-   HIGH: >60% sector concentration or score <40
-   MODERATE: Score 40-70
-   LOW: Score ≥70 with balanced sectors

**Smart Recommendations:** Identifies sector gaps, suggests specific stocks/ETFs with rationale, provides actionable rebalancing insights.

## 📋 Environment Configuration

### Backend (.env)

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portfolio_tracker
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password

JWT_SECRET=your_256_bit_secret_key
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

ALPHAVANTAGE_API_KEY=your_api_key
SPRING_PROFILES_ACTIVE=dev  # or prod
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)

```bash
REACT_APP_API_URL=http://localhost:8000/api
SKIP_PREFLIGHT_CHECK=true
```

### Frontend Production (.env.production)

```bash
REACT_APP_API_URL=https://api.yourdomain.com/api
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false
NODE_ENV=production
```

## 🎨 Frontend Production Features

### Security

-   ✅ Content Security Policy (CSP) headers
-   ✅ XSS Protection headers
-   ✅ Frame options protection
-   ✅ HTTPS enforcement (HSTS)
-   ✅ Error boundary for crash protection
-   ✅ Production-safe logging (console.log suppressed)

### Performance

-   ✅ Multi-stage Docker build
-   ✅ Static asset caching (1 year)
-   ✅ Gzip compression
-   ✅ Code splitting & tree shaking
-   ✅ No source maps in production
-   ✅ Optimized bundle size

### SEO & PWA

-   ✅ Comprehensive meta tags
-   ✅ Open Graph support
-   ✅ PWA manifest (installable)
-   ✅ Robots.txt configuration
-   ✅ Mobile responsive design

### Frontend Scripts

```bash
# Development
npm start              # Start dev server (localhost:3000)
npm test               # Run tests

# Production
npm run build:prod     # Optimized production build
npm run test:ci        # CI-ready tests with coverage
npx serve -s build     # Test production build locally
```

## 📁 Project Structure

```
├── backend/                    # Spring Boot 3.5 + Java 21
│   ├── src/main/java/com/portfolio/tracker/
│   │   ├── config/            # Security, JWT, CORS
│   │   ├── controller/        # REST controllers
│   │   ├── service/           # Business logic
│   │   ├── entity/            # JPA entities
│   │   └── repository/        # Data access
│   └── src/main/resources/
│       ├── application.properties      # Base config
│       ├── application-dev.properties  # Dev settings
│       └── application-prod.properties # Prod settings
│
├── frontend/                   # React 18 + TypeScript
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── auth/         # Authentication components
│   │   │   ├── portfolio/    # Portfolio components
│   │   │   ├── ai/           # AI insights components
│   │   │   └── ErrorBoundary.tsx
│   │   ├── services/          # API integration
│   │   ├── contexts/          # Auth context
│   │   ├── pages/             # Page components
│   │   ├── types/             # TypeScript definitions
│   │   └── utils/             # Utility functions (logger, etc.)
│   ├── public/
│   │   ├── manifest.json      # PWA manifest
│   │   └── robots.txt         # SEO configuration
│   ├── nginx.conf             # Production server config
│   ├── Dockerfile             # Multi-stage production build
│   └── .dockerignore          # Docker build optimization
│
├── docker-compose.yml          # Dev environment
├── docker-compose.prod.yml     # Production environment
└── generate-secrets.sh         # Security helper
```

## 🧪 Testing

```bash
# Backend tests
cd backend && ./mvnw test

# Frontend tests
cd frontend && npm test

# Health check
curl http://localhost:8000/api/health
```

## 🐛 Troubleshooting

**Backend won't start:**

```bash
docker-compose logs backend  # Check logs
cat .env                     # Verify environment
```

**Frontend can't connect:**

-   Verify `REACT_APP_API_URL` in `frontend/.env.local`
-   Check `ALLOWED_ORIGINS` in backend `.env`
-   Test backend: `curl http://localhost:8000/api/health`

**Database errors:**

```bash
docker-compose ps            # Check status
docker-compose logs postgres # View logs
```

## 📚 Additional Documentation

-   **[PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)** - Complete production deployment guide
-   **[SECURITY.md](SECURITY.md)** - Security features and best practices
-   **[backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)** - Full API reference

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

-   [Alpha Vantage](https://www.alphavantage.co/) - Stock market data API
-   Spring Boot & React teams for excellent frameworks
-   Open-source community

---

**Built with ❤️ using Spring Boot 3.5 and React 18**  
**Version:** 1.0.0 | **Status:** Production Ready ✅
