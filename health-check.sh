#!/bin/bash

# Health Check Script for Production Deployment
# Run this after deployment to verify all services are healthy

echo "🏥 Financial Portfolio Tracker - Health Check"
echo "=============================================="
echo ""

BACKEND_URL="${BACKEND_URL:-http://localhost:8000/api}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:80}"

check_service() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Checking $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "$expected" ]; then
        echo "✅ OK (HTTP $response)"
        return 0
    else
        echo "❌ FAILED (HTTP $response, expected $expected)"
        return 1
    fi
}

check_service_json() {
    local name=$1
    local url=$2
    
    echo -n "Checking $name... "
    
    response=$(curl -s "$url" 2>/dev/null)
    
    if echo "$response" | grep -q "status"; then
        echo "✅ OK"
        echo "   Response: $response"
        return 0
    else
        echo "❌ FAILED"
        echo "   Response: $response"
        return 1
    fi
}

failed=0

echo "Testing Backend Health Endpoint..."
check_service_json "Backend API" "$BACKEND_URL/health" || ((failed++))

echo ""
echo "Testing Frontend Health Endpoint..."
check_service "Frontend" "$FRONTEND_URL/health" "200" || ((failed++))

echo ""
echo "Testing Backend Actuator..."
check_service "Actuator Health" "$BACKEND_URL/actuator/health" "200" || ((failed++))

echo ""
echo "Testing Backend Auth Endpoint..."
check_service "Auth Endpoint" "$BACKEND_URL/auth/login" "400" || ((failed++))

echo ""
echo "=============================================="
if [ $failed -eq 0 ]; then
    echo "✅ All health checks passed!"
    echo ""
    echo "🎉 Your application is running correctly!"
    exit 0
else
    echo "❌ $failed health check(s) failed!"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check if all containers are running: docker-compose ps"
    echo "  2. Check logs: docker-compose logs -f"
    echo "  3. Verify environment variables in .env"
    exit 1
fi
