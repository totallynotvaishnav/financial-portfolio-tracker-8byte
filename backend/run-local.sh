#!/bin/bash

# Financial Portfolio Tracker - Local Development Setup
echo "🚀 Starting Financial Portfolio Tracker Backend (Local PostgreSQL)"
echo "=============================================================="

# Check if we're in the right directory
if [ ! -f "pom.xml" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    echo "Usage: cd backend && ./run-local.sh"
    exit 1
fi

# Check if PostgreSQL is running (basic check)
echo "🔍 Checking PostgreSQL connection..."
if ! nc -z localhost 5432 2>/dev/null; then
    echo "⚠️  Warning: Cannot connect to PostgreSQL on localhost:5432"
    echo "   Please make sure PostgreSQL is running and accessible"
    echo "   You can start it using: brew services start postgresql"
    echo ""
fi

echo "📊 Database Configuration:"
echo "   Host: localhost:5432"
echo "   Database: portfolio_tracker"
echo "   Username: postgres"
echo ""

echo "🏗️  Building and starting Spring Boot application..."
echo "   This may take a moment on first run..."
echo ""

# Run the Spring Boot application
./mvnw spring-boot:run

echo ""
echo "✅ Application started!"
echo "   API Base URL: http://localhost:8000/api"
echo "   Sample endpoints:"
echo "   - GET http://localhost:8000/api/stocks"
echo "   - GET http://localhost:8000/api/portfolios"
echo ""
echo "Press Ctrl+C to stop the application"