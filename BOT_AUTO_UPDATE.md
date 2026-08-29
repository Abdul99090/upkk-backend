# PUKK - Fitur Bot Auto-Update

## Overview

Bot Auto-Update adalah sistem otomatis yang memonitor kesehatan aplikasi, menangani error, dan melakukan update otomatis dengan kemampuan rollback.

## Fitur Utama

### 1. **Scheduled Health Checks**
Menjalankan pengecekan kesehatan sistem setiap 5 menit:

```javascript
// Checks for:
- Database connectivity
- Failed/Stuck transactions
- Payment timeouts
- System resources
- Memory usage
```

### 2. **Automatic Updates**
Update sistem berjalan setiap jam dengan:

```javascript
// Features:
- Gradual rollout (percentage control)
- Automatic rollback on failure
- Version tracking
- Change logging
```

### 3. **Error Handling & Recovery**
Menangani error dan melakukan recovery otomatis:

```javascript
// Handles:
- Transaction timeouts
- Connection failures
- Payment processing errors
- File upload failures
```

### 4. **Notification System**
Notifikasi realtime ke admin tentang:

```javascript
// Notifications:
- Update status (success/failed)
- Health check alerts
- Error warnings
- System maintenance
```

## Konfigurasi

Edit `.env` untuk konfigurasi bot:

```env
# Auto Update Bot Configuration
BOT_ENABLED=true
BOT_CHECK_INTERVAL=3600000  # 1 hour in milliseconds

# Health Check (every 5 minutes)
HEALTH_CHECK_INTERVAL=300000  # 5 minutes

# Sentry for error tracking
SENTRY_DSN=https://your-sentry-dsn

# Bot notification settings
BOT_NOTIFICATION_EMAIL=admin@pukk.com
BOT_ALERT_THRESHOLD=10  # Alert after 10 errors
```

## API untuk Manajemen Updates

### Get System Updates
```
GET /admin/system/updates
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "update-id",
      "version": "1.2.0",
      "title": "Bug Fix: Payment QRIS",
      "description": "Fixed QRIS payment timeout issue",
      "type": "bug_fix",
      "severity": "high",
      "status": "completed",
      "autoUpdate": true,
      "rolloutPercentage": 100,
      "isActive": true,
      "changeLog": ["Fixed timeout", "Improved error handling"],
      "completedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Create Update
```
POST /admin/system/updates
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "version": "1.2.1",
  "title": "Feature: New Payment Method",
  "description": "Added OVO payment method",
  "type": "feature",
  "severity": "medium",
  "autoUpdate": true,
  "changeLog": ["Added OVO support", "Updated UI"],
  "releaseNotes": "Now supports OVO e-wallet...",
  "rollbackScript": "ALTER TABLE payments..."
}
```

### Update System Update
```
PUT /admin/system/updates/:id
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "status": "in_progress",
  "rolloutPercentage": 50
}
```

### Get Update Logs
```
GET /admin/system/update-logs?page=1&limit=20
Authorization: Bearer <admin_token>
```

## Bot Service Architecture

### Main Components

```
services/botService.js
├── startAutoUpdateBot()
│   ├── Scheduled check (hourly)
│   └── Initial check on startup
│
├── checkAndApplyUpdates()
│   └── Fetch pending updates
│       └── Apply each update
│
├── applyUpdate()
│   ├── Update status to 'in_progress'
│   ├── Download/Apply update
│   ├── Verify update
│   ├── Mark as completed
│   └── Notify admins
│
├── rollbackUpdate()
│   └── Execute rollback script
│
├── scheduleHealthCheck()
│   ├── Check DB connectivity
│   ├── Check stuck transactions
│   └── Check payment timeouts
│
└── notifyAdmins()
    └── Send notifications to all admins
```

### Error Handling Flow

```
Error Detected
    ↓
Log Error (AuditLog)
    ↓
Check Severity
    ├─ LOW: Log only
    ├─ MEDIUM: Log + Store update record
    ├─ HIGH: Log + Store + Notify admin
    └─ CRITICAL: Log + Notify + Attempt auto-fix
    ↓
Auto-Fix Attempt (if applicable)
    ├─ Success: Update status, Notify
    └─ Failed: Attempt rollback, Notify admin
```

## Health Check Details

### Transaction Timeouts
```javascript
// Checks for pending transactions > 1 hour
// Marks as failed and updates karyawan
// Creates audit log entry
```

### Database Health
```javascript
// Connection test
// Query performance
// Disk space
// Memory usage
```

### Payment Status
```javascript
// Failed payments > 30 minutes
// Expired QRIS codes
// Unconfirmed payments > 24 hours
```

## Update Process Example

### Step 1: Create Update
Admin membuat update di database dengan status 'pending'

### Step 2: Bot Detection
Bot mendeteksi update pending pada check interval berikutnya

### Step 3: Apply Update
```javascript
Update status → 'in_progress'
Download update files
Backup current version
Apply update
Verify update success
Update status → 'completed'
```

### Step 4: Rollback (if needed)
```javascript
// If update fails:
Detect failure
Execute rollback script
Restore previous version
Update status → 'failed'
Notify admin with error details
```

### Step 5: Notification
Email/Push notification ke semua admin tentang:
- Update version
- Status (success/failed)
- Timestamp
- Error details (jika ada)

## Monitoring Bot Status

### Check Bot Status
```
GET /admin/system/bot-status
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "isRunning": true,
  "lastCheck": "2024-01-15T10:30:00Z",
  "lastUpdate": "2024-01-15T09:30:00Z",
  "nextCheck": "2024-01-15T11:30:00Z",
  "healthScore": 95,
  "pendingUpdates": 2,
  "failedUpdates": 0,
  "lastError": null
}
```

### View Bot Logs
```
GET /admin/system/bot-logs?limit=50
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "logs": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "action": "CHECK_START",
      "status": "success",
      "message": "Checking for updates..."
    },
    {
      "timestamp": "2024-01-15T10:31:00Z",
      "action": "UPDATE_FOUND",
      "status": "info",
      "message": "Found 1 pending update (v1.2.0)"
    },
    {
      "timestamp": "2024-01-15T10:35:00Z",
      "action": "UPDATE_COMPLETED",
      "status": "success",
      "message": "Update v1.2.0 applied successfully"
    }
  ]
}
```

## Admin Dashboard - Bot Status Widget

Admin dapat melihat bot status di dashboard:

```
Bot Auto-Update Status
├─ Status: ACTIVE ✓
├─ Last Check: 15 min ago
├─ Pending Updates: 2
├─ Health: 95%
├─ Next Check: 45 min
└─ Actions:
    ├─ View Logs
    ├─ Manual Check
    ├─ Configure
    └─ Stop/Start
```

## Testing Bot Functionality

### Test Health Check
```bash
# Force health check immediately
curl -X POST http://localhost:5000/admin/system/bot/health-check \
  -H "Authorization: Bearer <token>"
```

### Test Update Application
```bash
# Create test update
POST /admin/system/updates with:
{
  "version": "1.0.1-test",
  "title": "Test Update",
  "autoUpdate": true,
  "severity": "low"
}

# Bot akan automatically detect & apply
```

### View Update Results
```bash
# Check logs
GET /admin/system/update-logs
```

## Best Practices

### 1. Update Scheduling
- Schedule updates during low-traffic hours
- Use gradual rollout (start 10%, increase to 100%)
- Always have rollback script ready

### 2. Error Handling
- Log all errors with full context
- Include error details in admin notifications
- Implement exponential backoff for retries

### 3. Monitoring
- Check bot health regularly
- Monitor error rates
- Review update logs periodically

### 4. Database Maintenance
- Regular backups before updates
- Test updates in staging first
- Monitor transaction integrity

## Troubleshooting

### Bot Not Running
```bash
# Check .env
BOT_ENABLED=true

# Check logs
npm run dev  # See console logs

# Restart bot
# Edit: /workspaces/upkk-backend/server.js
// Add: startAutoUpdateBot() in startServer()
```

### Update Stuck in Progress
```javascript
// Manually mark as failed:
UPDATE "SystemUpdates" SET "status" = 'failed', "failedReason" = 'Manual reset'
WHERE "version" = 'v1.2.0';
```

### Rollback Failed
```javascript
// Manually restore:
1. Stop application
2. Restore from backup
3. Update database status
4. Restart application
5. Review logs for cause
```

## Future Enhancements

- [ ] Implement canary deployment (5% → 25% → 50% → 100%)
- [ ] Add automatic performance testing
- [ ] Implement database schema versioning
- [ ] Add mobile app update notifications
- [ ] Create update scheduling UI
- [ ] Implement blue-green deployment
- [ ] Add A/B testing capability

---

**Last Updated**: 2024
