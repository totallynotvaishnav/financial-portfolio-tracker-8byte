# Production Deployment Guide

## Prerequisites

Before deploying to production, ensure you have:

1. **PostgreSQL Database** - Version 14+
2. **Docker & Docker Compose** - Latest versions
3. **SSL Certificates** (for HTTPS)
4. **Domain name** configured with DNS

## Security Checklist

### ⚠️ CRITICAL: Before Production Deployment

-   [ ] Generate a strong JWT secret (min 256 bits)
-   [ ] Set secure database passwords
-   [ ] Configure CORS with specific allowed origins (no wildcards)
-   [ ] Obtain Alpha Vantage API key
-   [ ] Set `SPRING_PROFILES_ACTIVE=prod`
-   [ ] Review all environment variables
-   [ ] Enable HTTPS/SSL
-   [ ] Configure firewall rules
-   [ ] Set up database backups
-   [ ] Configure logging and monitoring

## Environment Configuration

### 1. Create Production Environment File

Copy the example file and fill in secure values:

```bash
cp .env.example .env
```

Edit `.env` with production values:

```bash
# Database - Use strong passwords
DB_HOST=postgres
DB_PORT=5432
DB_NAME=portfolio_tracker
DB_USERNAME=postgres
DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE

# JWT - Generate a secure random key
JWT_SECRET=YOUR_256_BIT_SECURE_RANDOM_KEY
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Alpha Vantage API
ALPHAVANTAGE_API_KEY=YOUR_API_KEY

# Application
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8000

# CORS - Set your frontend domain
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Frontend
REACT_APP_API_URL=https://api.yourdomain.com/api
```

### 2. Generate Secure JWT Secret

```bash
# Using OpenSSL
openssl rand -base64 64

# Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(64))"

# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

## Deployment Options

### Option 1: Docker Compose (Recommended for Small-Medium Scale)

#### Development Mode

```bash
docker-compose up --build
```

#### Production Mode

```bash
# Load environment variables
source .env

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Option 2: Manual Deployment

#### Backend Deployment

```bash
cd backend

# Build the application
./mvnw clean package -DskipTests

# Run with production profile
export SPRING_PROFILES_ACTIVE=prod
export DB_HOST=your-db-host
export DB_USERNAME=your-db-user
export DB_PASSWORD=your-db-password
export JWT_SECRET=your-jwt-secret
export ALPHAVANTAGE_API_KEY=your-api-key
export ALLOWED_ORIGINS=https://yourdomain.com

java -jar target/tracker-0.0.1-SNAPSHOT.jar
```

#### Frontend Deployment

```bash
cd frontend

# Install dependencies
npm ci --only=production

# Build for production
REACT_APP_API_URL=https://api.yourdomain.com/api npm run build

# Serve with nginx (copy build/ to nginx root)
```

### Option 3: Cloud Platform Deployment

#### AWS Elastic Beanstalk / ECS

1. Build Docker images
2. Push to ECR (Elastic Container Registry)
3. Deploy using ECS task definitions
4. Configure RDS for PostgreSQL
5. Set environment variables in task definition

#### Google Cloud Run / Cloud Build

1. Build and push to GCR
2. Deploy to Cloud Run
3. Use Cloud SQL for PostgreSQL
4. Configure environment variables in service

#### Azure App Service / Container Instances

1. Push to Azure Container Registry
2. Deploy to App Service or Container Instances
3. Use Azure Database for PostgreSQL
4. Set application settings

## Database Setup

### Initial Schema Creation

The application uses Hibernate with `ddl-auto=validate` in production. You must create the schema first:

#### Option 1: Use Development Mode First

```bash
# Temporarily set to update
SPRING_PROFILES_ACTIVE=dev
# Run application once to create schema
# Then switch to prod
```

#### Option 2: Run SQL Migration Scripts

```bash
# Connect to your database
psql -h your-db-host -U your-db-user -d portfolio_tracker

# Run schema creation scripts (if you have them)
\i schema.sql
```

### Database Backups

Set up automated backups:

```bash
# Daily backup script
pg_dump -h localhost -U postgres portfolio_tracker > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h localhost -U postgres portfolio_tracker < backup_20231001.sql
```

## SSL/HTTPS Configuration

### Using Let's Encrypt with Nginx

1. Install Certbot:

```bash
sudo apt-get install certbot python3-certbot-nginx
```

2. Obtain certificate:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

3. Auto-renewal:

```bash
sudo certbot renew --dry-run
```

### Update nginx.conf for HTTPS

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # ... rest of config
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring and Logging

### Health Check Endpoints

-   Backend: `http://localhost:8000/api/health`
-   Frontend: `http://localhost:80/health`
-   Actuator: `http://localhost:8000/api/actuator/health`

### Log Locations

-   Docker logs: `docker-compose logs -f [service]`
-   Application logs: Check container stdout/stderr
-   Nginx logs: `/var/log/nginx/` in container

### Recommended Monitoring Tools

-   **Application Performance**: New Relic, DataDog, Elastic APM
-   **Infrastructure**: Prometheus + Grafana
-   **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
-   **Uptime Monitoring**: UptimeRobot, Pingdom

## Scaling Considerations

### Horizontal Scaling

1. **Backend**: Run multiple instances behind a load balancer

    - Ensure stateless design (JWT tokens)
    - Use external session storage if needed

2. **Database**:

    - Enable connection pooling (HikariCP configured in prod profile)
    - Consider read replicas for read-heavy workloads
    - Use database clustering for high availability

3. **Frontend**:
    - Use CDN for static assets
    - Multiple nginx instances behind load balancer

### Performance Optimization

1. **Enable Response Compression** (already configured in nginx)
2. **Database Indexing**: Review and optimize queries
3. **Caching**: Consider Redis for API responses
4. **CDN**: Use CloudFlare, CloudFront, or similar

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Common issues:
# - Database not ready: Wait for postgres health check
# - Missing environment variables: Check .env file
# - Port already in use: Change SERVER_PORT
```

### Frontend can't connect to backend

```bash
# Check CORS settings
# Verify ALLOWED_ORIGINS includes frontend domain
# Ensure REACT_APP_API_URL is correct

# Test API directly
curl http://localhost:8000/api/health
```

### Database connection errors

```bash
# Verify database is running
docker-compose ps

# Test connection
psql -h localhost -U postgres -d portfolio_tracker

# Check credentials match in .env and application
```

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use secrets management** (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)
3. **Regular security updates**: Keep dependencies updated
4. **API rate limiting**: Implement rate limiting middleware
5. **Input validation**: Already configured with Spring Validation
6. **SQL injection protection**: Use JPA/Hibernate (already implemented)
7. **XSS protection**: Security headers configured in nginx
8. **Regular backups**: Automate database backups
9. **Audit logging**: Log authentication events and sensitive operations
10. **Firewall rules**: Restrict access to necessary ports only

## Rollback Procedure

```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Restore from backup
psql -h localhost -U postgres portfolio_tracker < backup_latest.sql

# Deploy previous version
git checkout <previous-tag>
docker-compose -f docker-compose.prod.yml up -d --build
```

## Support and Maintenance

### Regular Maintenance Tasks

-   [ ] Weekly: Review logs for errors
-   [ ] Weekly: Check disk space and database size
-   [ ] Monthly: Update dependencies and security patches
-   [ ] Monthly: Review and rotate secrets
-   [ ] Quarterly: Load testing and performance review
-   [ ] Quarterly: Disaster recovery drill

### Getting Help

-   Check application logs
-   Review this documentation
-   Check GitHub issues
-   Contact support team

## Version Information

-   Application Version: 1.0.0
-   Spring Boot: 3.5.0
-   Java: 21
-   PostgreSQL: 16
-   Node.js: 20
-   React: 18
