# PUKK - Setup & Deployment Guide

## 📋 Daftar Isi
1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Docker Setup](#docker-setup)
4. [Production Deployment](#production-deployment)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- Node.js >= 14.x
- PostgreSQL >= 12.x
- npm atau yarn
- Docker & Docker Compose (untuk Docker setup)
- Git

### Install Node.js & PostgreSQL

**Ubuntu/Debian:**
```bash
# Update package manager
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
# Using Homebrew
brew install node postgresql

# Start PostgreSQL
brew services start postgresql
```

## Development Setup

### 1. Clone Repository
```bash
cd /workspaces/upkk-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database

Create PostgreSQL database:
```bash
sudo -u postgres createdb upkk_db
```

Or using psql:
```bash
sudo -u postgres psql
CREATE DATABASE upkk_db;
\q
```

### 4. Create Environment File
```bash
cp .env.example .env
```

Edit `.env` dengan konfigurasi Anda:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=upkk_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-key-change-this
PORT=5000
NODE_ENV=development
```

### 5. Initialize Database
```bash
# Sync database tables
npm run migrate

# Seed initial data (admin, lokasi absen, sample karyawan & nasabah)
npm run seed
```

### 6. Start Development Server
```bash
npm run dev
```

Server akan berjalan di: `http://localhost:5000`

### 7. Test API
```bash
# Health check
curl http://localhost:5000/api/health

# Login Admin
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pukk.com",
    "password": "admin123456"
  }'
```

## Docker Setup

### Prerequisites
- Docker installed
- Docker Compose installed

### 1. Build & Run with Docker Compose
```bash
# Navigate to project directory
cd /workspaces/upkk-backend

# Build images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Seed database
docker-compose exec backend npm run seed
```

### 2. Access Services
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

### 3. Useful Docker Commands
```bash
# Stop services
docker-compose down

# View logs
docker-compose logs backend

# Execute command in container
docker-compose exec backend npm run seed

# Restart services
docker-compose restart
```

## Production Deployment

### 1. Using Cloud Providers

#### Deploy to Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create pukk-backend

# Add PostgreSQL add-on
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret-key
heroku config:set BOT_ENABLED=true

# Deploy
git push heroku main

# Seed database
heroku run npm run seed
```

#### Deploy to AWS EC2
```bash
# 1. SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# 2. Install dependencies
sudo apt update
sudo apt install -y nodejs npm postgresql postgresql-contrib git

# 3. Clone repository
git clone your-repo-url
cd upkk-backend

# 4. Install npm packages
npm install

# 5. Setup PostgreSQL
sudo -u postgres createdb upkk_db

# 6. Configure environment
cp .env.example .env
# Edit .env with production values

# 7. Run migrations
npm run migrate
npm run seed

# 8. Start with PM2 (process manager)
npm install -g pm2
pm2 start server.js --name "pukk-backend"
pm2 startup
pm2 save
```

#### Deploy to DigitalOcean
```bash
# 1. Create Droplet with Ubuntu 22.04

# 2. SSH into droplet
ssh root@your_droplet_ip

# 3. Run setup script
curl https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 4. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Clone and deploy
git clone your-repo-url
cd upkk-backend
docker-compose -f docker-compose.prod.yml up -d

# 6. Setup Nginx reverse proxy
sudo apt install nginx
# Configure nginx (see Nginx config section)
```

### 2. Environment Configuration for Production

Create `.env.production`:
```env
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=upkk_prod_db
DB_USER=prod_user
DB_PASSWORD=strong_password_here

PORT=5000
NODE_ENV=production

JWT_SECRET=very-long-and-complex-secret-key-here
JWT_EXPIRE=7d

QRIS_API_KEY=your_production_qris_key
QRIS_MERCHANT_ID=your_production_merchant_id

BOT_ENABLED=true
BOT_CHECK_INTERVAL=3600

SENTRY_DSN=your_sentry_dsn_for_error_tracking

# Email settings for notifications
EMAIL_SERVICE=gmail
EMAIL_USER=noreply@pukk.com
EMAIL_PASSWORD=your_app_password
```

### 3. Nginx Configuration

Create `/etc/nginx/sites-available/pukk-backend`:
```nginx
upstream pukk_backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL certificates (using Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Client upload size
    client_max_body_size 10M;

    # Proxy settings
    location / {
        proxy_pass http://pukk_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files
    location /uploads {
        alias /app/uploads;
        expires 30d;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/pukk-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d your-domain.com

# Auto renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Monitoring & Logging

### 1. PM2 Monitoring (for server deployments)
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server.js --name "pukk-backend"

# Monitor
pm2 monit

# View logs
pm2 logs pukk-backend

# Setup auto-restart
pm2 startup
pm2 save
```

### 2. Docker Health Checks
Configured in docker-compose.yml

### 3. Error Tracking (Sentry)
Set SENTRY_DSN in .env for automatic error tracking

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U postgres -h localhost -d upkk_db

# Check connection string in .env
# Format: postgres://user:password@host:port/database
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change PORT in .env
PORT=5001
```

### Migration Failures
```bash
# Reset database (WARNING: Deletes all data)
npm run db:reset

# Or manually:
sudo -u postgres dropdb upkk_db
sudo -u postgres createdb upkk_db
npm run migrate
npm run seed
```

### JWT Token Issues
```bash
# Regenerate JWT secret
# In .env, change JWT_SECRET to a new value
JWT_SECRET=new-super-secret-key-$(date +%s)

# Restart server
npm run dev
```

### File Upload Not Working
```bash
# Check uploads directory
ls -la ./uploads

# Create if not exists
mkdir -p ./uploads
chmod 755 ./uploads

# In Docker
docker-compose exec backend mkdir -p /app/uploads
```

## Performance Optimization

### 1. Database Optimization
```sql
-- Create indexes
CREATE INDEX idx_karyawan_email ON "Karyawans"(email);
CREATE INDEX idx_nasabah_karyawan ON "Nasabahs"(karyawanId);
CREATE INDEX idx_transaksi_type ON "Transaksis"(type);
CREATE INDEX idx_payment_status ON "PaymentQRISs"(status);
```

### 2. API Caching
- Implement Redis caching for frequently accessed data
- Use response compression (already configured with compression middleware)

### 3. Database Connection Pool
- Adjust pool size in config/database.js based on load

## Backup & Recovery

### Automated Backups
```bash
# Backup PostgreSQL
pg_dump -U postgres upkk_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql -U postgres upkk_db < backup_20240101_120000.sql
```

### Docker Backup
```bash
# Backup database volume
docker-compose exec postgres pg_dump -U postgres upkk_db > backup.sql

# Backup uploads
docker cp upkk_backend:/app/uploads ./uploads_backup
```

## Support & Help

- Documentation: Check README.md
- Issues: Create GitHub issue
- Email: support@pukk.com

---

**Last Updated**: 2024
