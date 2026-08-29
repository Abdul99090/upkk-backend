# PUKK - Developer Quick Reference

## 🚀 Quick Start Commands

### Setup
```bash
# 1. Clone or extract project
cd upkk-backend

# 2. Run setup script
bash setup.sh

# 3. Install dependencies (if not done by setup)
npm install

# 4. Configure environment
cp .env.example .env
# Edit .env with your settings

# 5. Setup database (choose one)
# Option A: Docker
docker-compose up -d
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed

# Option B: Local PostgreSQL
npm run migrate
npm run seed

# 6. Start development server
npm run dev

# 7. Server runs at:
# http://localhost:5000/api
```

---

## 📝 Common npm Commands

```bash
# Development
npm run dev          # Start with auto-reload (nodemon)

# Production
npm start            # Start production server

# Database
npm run migrate      # Run migrations (create tables)
npm run seed         # Seed test data

# Debugging
DEBUG=* npm run dev  # Enable debug logging

# Package Management
npm install          # Install dependencies
npm update           # Update dependencies
npm list             # Show installed packages
```

---

## 📊 API Endpoints Quick Reference

### Authentication
```bash
# Login Admin
POST /api/auth/admin/login
Body: { email, password }

# Login Karyawan
POST /api/auth/karyawan/login
Body: { email, password }

# Verify Token
POST /api/auth/verify-token
Headers: { Authorization: Bearer <token> }

# Refresh Token
POST /api/auth/refresh-token
Headers: { Authorization: Bearer <token> }

# Change Password
POST /api/auth/change-password
Body: { oldPassword, newPassword }
```

### Admin Endpoints
```bash
# Dashboard
GET /api/admin/dashboard

# Karyawan CRUD
GET /api/admin/karyawan
POST /api/admin/karyawan (with file upload)
PUT /api/admin/karyawan/:id
DELETE /api/admin/karyawan/:id

# Location Management
POST /api/admin/lokasi-absen
GET /api/admin/lokasi-absen
PUT /api/admin/lokasi-absen/:id

# Reports
GET /api/admin/report/revenue
```

### Karyawan Endpoints
```bash
# Profile
GET /api/karyawan/profile
PUT /api/karyawan/profile (with file upload)

# Attendance
POST /api/karyawan/absensi/check-in
POST /api/karyawan/absensi/check-out
GET /api/karyawan/absensi/today
GET /api/karyawan/absensi/history

# Customers
GET /api/karyawan/nasabah
```

### Nasabah Endpoints
```bash
# CRUD
POST /api/nasabah/create (with file uploads)
GET /api/nasabah/:id
PUT /api/nasabah/:id
GET /api/nasabah/stats/summary
GET /api/nasabah/search/query
```

### Payment Endpoints
```bash
# QRIS Generation
POST /api/payment/qris/generate
POST /api/payment/qris/confirm

# Payment History
GET /api/payment/history/nasabah/:nasabahId

# Withdrawals
POST /api/payment/withdrawal/request
GET /api/payment/withdrawals/pending
POST /api/payment/withdrawals/:id/approve
POST /api/payment/withdrawals/:id/reject

# Balance
GET /api/payment/balance/karyawan
```

### Report Endpoints
```bash
GET /api/report/revenue
GET /api/report/withdrawals
GET /api/report/absensi-daily
GET /api/report/karyawan-performance
GET /api/report/top-nasabah
GET /api/report/monthly-summary
GET /api/report/payment-status
GET /api/report/karyawan/personal-report
```

---

## 🔐 Authentication Headers

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

Example:
```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📝 Request/Response Format

### Request Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

### Response Format (Success)
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Response Format (Error)
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

### HTTP Status Codes
```
200 - OK (Success)
201 - Created (Resource created)
400 - Bad Request (Invalid input)
401 - Unauthorized (Missing/invalid token)
403 - Forbidden (No permission)
404 - Not Found (Resource not found)
409 - Conflict (Duplicate entry)
422 - Validation Failed (Invalid data)
500 - Internal Server Error
```

---

## 🗄️ Database Quick Reference

### Connect to Database
```bash
# PostgreSQL
psql -U postgres -d upkk_db

# Inside psql:
\dt          # Show all tables
\du          # Show users
\l           # Show databases
\q           # Quit
```

### Common SQL Queries
```sql
-- Check admin users
SELECT email, role FROM "Admins";

-- Check karyawan
SELECT id, email, name FROM "Karyawans";

-- Check transactions
SELECT * FROM "Transaksis" LIMIT 10;

-- Check attendance today
SELECT * FROM "Absensis" WHERE DATE("checkInTime") = CURRENT_DATE;

-- Count by status
SELECT status, COUNT(*) FROM "Transaksis" GROUP BY status;

-- Revenue report
SELECT SUM(amount) as total FROM "Transaksis" 
WHERE type='pemasukan' AND status='completed';
```

### Reset Database
```bash
# Warning: Deletes all data!
npm run migrate:reset
npm run seed
```

---

## 🔍 File Upload Handling

### Supported File Types
- Images: jpg, jpeg, png, gif
- Documents: pdf

### Max File Size
- Default: 5MB
- Configure: Edit .env `MAX_FILE_SIZE`

### Upload Endpoints
```bash
# Create Karyawan with photo
POST /api/admin/karyawan
multipart/form-data:
  - name: "name"
  - email: "email@pukk.com"
  - profilePhoto: <file>
  - ktpPhoto: <file>

# Create Nasabah with photos
POST /api/nasabah/create
multipart/form-data:
  - name: "name"
  - nik: "3173012345678901"
  - ktpPhoto: <file>
  - profilePhoto: <file>
```

### File Storage
- Uploaded files: `/uploads/` directory
- Karyawan photos: `/uploads/karyawan/`
- Nasabah photos: `/uploads/nasabah/`

---

## 🤖 Bot Auto-Update Commands

### Check Bot Status
```bash
GET /api/admin/system/bot-status
```

### Trigger Manual Health Check
```bash
POST /api/admin/system/bot/health-check
```

### View Bot Logs
```bash
GET /api/admin/system/bot-logs?limit=50
```

### Get Updates
```bash
GET /api/admin/system/updates
```

### Create Update
```bash
POST /api/admin/system/updates
Body: {
  version: "1.2.1",
  title: "Bug Fix",
  type: "bug_fix",
  severity: "medium",
  autoUpdate: true,
  changeLog: ["Fix 1", "Fix 2"],
  releaseNotes: "..."
}
```

---

## 🔐 Testing Credentials

After running `npm run seed`:

### Admin User
```
Email: admin@pukk.com
Password: admin123456
Role: super_admin
```

### Karyawan User
```
Email: karyawan@pukk.com
Password: karyawan123456
Phone: 08123456789
NIK: 3173012345678901
```

### Test with curl
```bash
# Login
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pukk.com",
    "password": "admin123456"
  }'

# Get token from response
# Use token in Authorization header for next requests
```

---

## 🌍 Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=upkk_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_POOL_MAX=5

# JWT
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Bot
BOT_ENABLED=true
BOT_CHECK_INTERVAL=3600000  # 1 hour

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_DIR=uploads

# Email (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Sentry (optional)
SENTRY_DSN=your-sentry-dsn

# Rate Limiting
RATE_LIMIT_WINDOW=900000  # 15 minutes
RATE_LIMIT_MAX=100
```

---

## 🐛 Debugging

### Enable Debug Mode
```bash
DEBUG=* npm run dev
```

### Check Logs
```bash
# Frontend (Expo)
# Check console in VS Code or terminal

# Backend (Node.js)
# Check terminal running npm run dev

# Database (PostgreSQL)
# Check PostgreSQL logs
tail -f /var/log/postgresql/postgresql.log
```

### VSCode Debugging
1. Install Node.js debugger
2. Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/server.js"
    }
  ]
}
```

---

## 📚 Important Files Reference

| File | Purpose | Key Content |
|------|---------|------------|
| server.js | Entry point | Express app setup |
| config/database.js | DB config | Sequelize setup |
| middleware/auth.js | Authentication | JWT verification |
| models/ | Data models | Table schemas |
| routes/ | API endpoints | Endpoint definitions |
| services/ | Business logic | QR, Bot services |
| .env.example | Template | Config template |

---

## 🔄 Git Workflow

```bash
# Clone repository
git clone <repo-url>
cd upkk-backend

# Create feature branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "feat: description of change"

# Push to remote
git push origin feature/new-feature

# Create pull request on GitHub
```

---

## 🚢 Deployment Quick Start

### Docker Compose
```bash
docker-compose up -d      # Start all services
docker-compose down       # Stop all services
docker-compose logs -f    # View logs
```

### Production Deployment
```bash
# Build Docker image
docker build -t pukk-backend .

# Push to registry
docker push your-registry/pukk-backend:latest

# Deploy to server
ssh user@server
docker pull your-registry/pukk-backend:latest
docker run -d --name pukk-backend \
  -e DATABASE_URL=... \
  -e JWT_SECRET=... \
  -p 5000:5000 \
  your-registry/pukk-backend:latest
```

---

## 💡 Pro Tips

1. **Always backup database before updates**
   ```bash
   pg_dump -U postgres upkk_db > backup.sql
   ```

2. **Use Postman for API testing**
   - Import API collection
   - Set environment variables
   - Test endpoints easily

3. **Monitor database connections**
   ```bash
   watch -n 1 "psql -U postgres upkk_db -c 'SELECT pid, usename, state FROM pg_stat_activity;'"
   ```

4. **Check API response times**
   ```bash
   # Add timing to curl
   curl -w "Total: %{time_total}s\n" -X GET http://localhost:5000/api/...
   ```

5. **Enable auto-reload for frontend**
   ```bash
   expo start -c  # Clear cache and restart
   ```

---

## 📞 Useful Resources

- PostgreSQL: https://www.postgresql.org/docs/
- Sequelize: https://sequelize.org/
- Express.js: https://expressjs.com/
- JWT: https://jwt.io/
- React Native: https://reactnative.dev/
- Expo: https://docs.expo.dev/

---

**Last Updated**: 2024
**Quick Navigation**: [README](README.md) | [API Docs](API_DOCUMENTATION.md) | [Deployment](DEPLOYMENT.md) | [Troubleshooting](TROUBLESHOOTING.md)
