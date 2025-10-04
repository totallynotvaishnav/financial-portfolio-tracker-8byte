#!/bin/bash

# Production Secret Generator Script
# This script helps generate secure random secrets for production deployment

echo "🔐 Financial Portfolio Tracker - Production Secret Generator"
echo "============================================================"
echo ""

# Function to generate random secret
generate_secret() {
    openssl rand -base64 "$1" 2>/dev/null || python3 -c "import secrets; print(secrets.token_urlsafe($1))" 2>/dev/null || node -e "console.log(require('crypto').randomBytes($1).toString('base64'))" 2>/dev/null
}

# Check if .env exists
if [ -f .env ]; then
    echo "⚠️  Warning: .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted. Existing .env file preserved."
        exit 1
    fi
fi

echo "Generating secure secrets..."
echo ""

# Generate JWT Secret (256 bits / 32 bytes)
JWT_SECRET=$(generate_secret 64)
echo "✅ JWT Secret generated"

# Generate Database Password
DB_PASSWORD=$(generate_secret 32)
echo "✅ Database Password generated"

# Prompt for API Key
echo ""
read -p "Enter your Alpha Vantage API Key (or press Enter to use 'demo'): " ALPHAVANTAGE_KEY
ALPHAVANTAGE_KEY=${ALPHAVANTAGE_KEY:-demo}

# Prompt for domain
echo ""
read -p "Enter your production domain (e.g., https://yourdomain.com): " DOMAIN
DOMAIN=${DOMAIN:-http://localhost:3000}

# Create .env file
cat > .env << EOF
# Production Environment Configuration
# Generated on $(date)
# ⚠️ KEEP THIS FILE SECRET - NEVER COMMIT TO VERSION CONTROL

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=portfolio_tracker
DB_USERNAME=postgres
DB_PASSWORD=${DB_PASSWORD}

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Alpha Vantage API Configuration
ALPHAVANTAGE_API_KEY=${ALPHAVANTAGE_KEY}

# Application Configuration
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8000

# CORS Configuration
ALLOWED_ORIGINS=${DOMAIN}

# Frontend Configuration
REACT_APP_API_URL=${DOMAIN}/api
EOF

echo ""
echo "✅ .env file created successfully!"
echo ""
echo "📋 Summary:"
echo "  - Database Password: [HIDDEN - check .env file]"
echo "  - JWT Secret: [HIDDEN - check .env file]"
echo "  - API Key: ${ALPHAVANTAGE_KEY}"
echo "  - Domain: ${DOMAIN}"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "  1. The .env file contains sensitive credentials"
echo "  2. Never commit .env to version control"
echo "  3. Backup your .env file securely"
echo "  4. Rotate secrets regularly (every 90 days recommended)"
echo ""
echo "🚀 Next Steps:"
echo "  1. Review the .env file"
echo "  2. Update ALLOWED_ORIGINS if needed"
echo "  3. Deploy with: docker-compose -f docker-compose.prod.yml up -d"
echo ""
