# PUKK - Troubleshooting & FAQ

## Common Issues & Solutions

---

## 🔧 Setup Issues

### Issue: Node.js not found
```
Error: command not found: node
```

**Solution:**
```bash
# Check if Node.js is installed
node --version

# If not installed, download from: https://nodejs.org/
# Or use package manager:
# macOS:
brew install node

# Ubuntu/Debian:
sudo apt-get update
sudo apt-get install nodejs npm

# Windows: Download installer from nodejs.org
```

---

### Issue: PostgreSQL connection refused
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**

Option 1: Start PostgreSQL service
```bash
# macOS
brew services start postgresql

# Ubuntu
sudo systemctl start postgresql

# Windows: Use Services Manager or PostgreSQL installer
```

Option 2: Use Docker Compose
```bash
docker-compose up -d
# This will start PostgreSQL automatically
```

Option 3: Update .env with correct host
```env
DB_HOST=your_postgres_server_ip
DB_PORT=5432
DB_NAME=upkk_db
DB_USER=postgres
DB_PASSWORD=your_password
```

---

### Issue: Database doesn't exist
```
Error: database "upkk_db" does not exist
```

**Solution:**
```bash
# Create database manually
createdb upkk_db

# Or if using sudo:
sudo -u postgres createdb upkk_db

# Then run migrations
npm run migrate

# And seed data
npm run seed
```

---

### Issue: Port 5000 already in use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**

Option 1: Kill process using port 5000
```bash
# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

Option 2: Use different port
```bash
# Edit .env
PORT=5001

# Or run with environment variable
PORT=5001 npm run dev
```

---

## 🔐 Authentication Issues

### Issue: Invalid token error
```
Error: Invalid token / Token expired
```

**Solutions:**

1. **If token expired:**
   - Frontend should call refresh token endpoint
   - Check if POST /api/auth/refresh-token works
   - Ensure JWT_SECRET is same across requests

2. **If token invalid:**
   ```bash
   # Check .env JWT_SECRET
   cat .env | grep JWT_SECRET
   
   # Should match frontend configuration
   ```

3. **Clear browser storage:**
   ```javascript
   // In browser console:
   localStorage.removeItem('authToken');
   localStorage.removeItem('userType');
   location.reload();
   ```

---

### Issue: Login fails with correct credentials
```
Error: Invalid email or password
```

**Solutions:**

1. **Check if user exists:**
   ```bash
   # Connect to database
   psql -U postgres -d upkk_db
   
   # Check admin users
   SELECT email, role FROM "Admins";
   
   # Check karyawan users
   SELECT email FROM "Karyawans";
   ```

2. **If not exists, seed data:**
   ```bash
   npm run seed
   
   # Default credentials:
   # Admin: admin@pukk.com / admin123456
   # Karyawan: karyawan@pukk.com / karyawan123456
   ```

3. **Reset password manually:**
   ```sql
   -- Connect to database first
   psql -U postgres -d upkk_db
   
   -- Update password (requires bcryptjs hash)
   -- Or use API: POST /api/auth/change-password
   ```

---

## 🗄️ Database Issues

### Issue: Database tables not created
```
Error: relation "Admins" does not exist
```

**Solution:**
```bash
# Run migrations (creates tables)
npm run migrate

# Verify tables exist
psql -U postgres -d upkk_db
\dt

# Should show: Admins, Karyawans, Nasabahs, etc.
```

---

### Issue: Seeding fails
```
Error: unique constraint violation
```

**Solutions:**

Option 1: Drop all tables and reseed
```bash
# WARNING: This will delete all data!
npm run migrate:reset
npm run seed
```

Option 2: Manually delete test data
```bash
# Connect to database
psql -U postgres -d upkk_db

# Delete test records
DELETE FROM "Admins" WHERE email='admin@pukk.com';
DELETE FROM "Karyawans" WHERE email='karyawan@pukk.com';

# Then run seed
npm run seed
```

---

### Issue: Connection pool exhausted
```
Error: connect timeout exceeded
```

**Solution:**
Increase connection pool in .env:
```env
# Increase pool size
DB_POOL_MAX=10
DB_POOL_MIN=2
DB_POOL_ACQUIRE=30000

# Or modify config/database.js:
pool: {
  max: 10,      // Increase from 5
  min: 2,
  acquire: 30000,
  idle: 10000
}
```

---

## 🚀 API Issues

### Issue: CORS error
```
Error: Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**

Add frontend URL to CORS in server.js:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8080',
    'https://yourdomain.com',
    'exp://your-expo-app'
  ],
  credentials: true
}));
```

---

### Issue: 500 Internal Server Error
```
Error: 500 Internal Server Error
```

**Solutions:**

1. **Check server logs:**
   ```bash
   # Terminal running npm run dev will show errors
   # Look for the full error message
   ```

2. **Enable debug mode:**
   ```env
   DEBUG=*
   LOG_LEVEL=debug
   ```

3. **Common causes:**
   - Database connection failed
   - Missing environment variable
   - Invalid file path
   - Unhandled exception

---

### Issue: File upload fails
```
Error: File upload failed
```

**Solutions:**

1. **Check file size:**
   ```bash
   # Max size is 5MB
   # Check .env MAX_FILE_SIZE
   
   # If file is large, increase in middleware/upload.js:
   .single('file')
   .limits({ fileSize: 10 * 1024 * 1024 }) // 10MB
   ```

2. **Check file type:**
   ```javascript
   // Allowed: jpg, jpeg, png, gif, pdf
   // Update filter in middleware/upload.js if needed
   ```

3. **Check uploads directory:**
   ```bash
   # Directory should exist
   ls -la uploads/
   
   # If not, create it:
   mkdir -p uploads/karyawan
   mkdir -p uploads/nasabah
   chmod 755 uploads/
   ```

4. **Check file permissions:**
   ```bash
   # Ensure write permissions
   chmod 755 uploads/
   chmod 755 /path/to/project
   ```

---

## 📱 Mobile App Issues

### Issue: App won't connect to API
```
Error: Cannot connect to backend
Network error
```

**Solutions:**

1. **Check API URL in .env:**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

2. **For Expo app:**
   ```javascript
   // src/services/api.js
   // Change localhost to your machine IP
   const API_URL = 'http://192.168.x.x:5000/api';
   ```

3. **Test API connectivity:**
   ```bash
   # From mobile device
   curl -X GET http://192.168.x.x:5000/api/health
   ```

4. **Check firewall:**
   ```bash
   # Allow port 5000
   # macOS: System Preferences > Security & Privacy > Firewall
   # Ubuntu: sudo ufw allow 5000
   # Windows: Windows Defender Firewall > Allow app through firewall
   ```

---

### Issue: Camera permission denied
```
Error: Camera permission required
```

**Solution:**
```javascript
// In AbsensiScreen.js, add permission request:
import * as ImagePicker from 'expo-image-picker';

const requestCameraPermission = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Camera access is required');
  }
};
```

---

### Issue: GPS location not working
```
Error: Location service unavailable
```

**Solutions:**

1. **Enable location services:**
   - iOS: Settings > Privacy > Location Services
   - Android: Settings > Location

2. **Check location permissions:**
   ```javascript
   // In AbsensiScreen.js
   import * as Location from 'expo-location';
   
   const { status } = await Location.requestForegroundPermissionsAsync();
   ```

3. **Use mock location for testing:**
   ```bash
   # Expo tunnel for testing
   expo start --tunnel
   ```

---

### Issue: Image picker not working
```
Error: Cannot select image
```

**Solution:**
```bash
# Ensure expo-image-picker is installed
npm install expo-image-picker

# Clear cache and rebuild
expo start -c
```

---

## 🤖 Bot Auto-Update Issues

### Issue: Bot not starting
```
Error: Bot failed to start
```

**Solutions:**

1. **Check BOT_ENABLED in .env:**
   ```env
   BOT_ENABLED=true
   ```

2. **Check bot logs:**
   ```bash
   # Look in console for bot initialization
   # Should show: "Auto-update bot started"
   ```

3. **Verify node-schedule installed:**
   ```bash
   npm list node-schedule
   # If not installed:
   npm install node-schedule
   ```

---

### Issue: Update stuck in progress
```
Status: in_progress (never completes)
```

**Solution:**
```sql
-- Connect to database
psql -U postgres -d upkk_db

-- Check stuck updates
SELECT * FROM "SystemUpdates" WHERE status='in_progress';

-- Manually mark as failed
UPDATE "SystemUpdates" 
SET status='failed', "failedReason"='Manual reset'
WHERE version='v1.2.0';
```

---

### Issue: Automatic rollback not working
```
Update failed but no rollback occurred
```

**Solutions:**

1. **Check rollback script exists:**
   ```sql
   SELECT "rollbackScript" FROM "SystemUpdates" 
   WHERE version='v1.2.0';
   ```

2. **Verify rollback syntax in database:**
   ```bash
   # Test rollback manually
   psql -U postgres -d upkk_db -c "ALTER TABLE ...;"
   ```

3. **Check bot service error handling:**
   ```bash
   # Look in botService.js rollbackUpdate function
   # Add logging to see rollback execution
   ```

---

## 📊 Performance Issues

### Issue: Slow API response
```
Response time > 1000ms
```

**Solutions:**

1. **Add database indexes:**
   ```sql
   CREATE INDEX idx_karyawan_email ON "Karyawans"(email);
   CREATE INDEX idx_nasabah_nik ON "Nasabahs"(nik);
   CREATE INDEX idx_transaksi_status ON "Transaksis"(status);
   ```

2. **Check query performance:**
   ```sql
   EXPLAIN ANALYZE 
   SELECT * FROM "Karyawans" WHERE email='test@pukk.com';
   ```

3. **Increase rate limit if needed:**
   ```javascript
   // In server.js
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 200  // Increase from 100
   });
   ```

---

### Issue: High memory usage
```
Memory: > 500MB
```

**Solutions:**

1. **Check for memory leaks:**
   ```bash
   node --inspect server.js
   # Open Chrome DevTools > Memory
   ```

2. **Reduce connection pool:**
   ```env
   DB_POOL_MAX=5
   DB_POOL_MIN=1
   ```

3. **Clear old logs:**
   ```bash
   rm -rf logs/*
   ```

---

## 🐛 Debugging Tips

### Enable Detailed Logging
```javascript
// In server.js, add:
if (process.env.DEBUG) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
  });
}
```

**Run with debug:**
```bash
DEBUG=* npm run dev
```

### Check Database Connections
```bash
# In psql console
SELECT pid, usename, state FROM pg_stat_activity;

# Kill stuck connection if needed
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE usename = 'postgres' AND pid != pg_backend_pid();
```

### Test API Endpoints with Curl
```bash
# Login
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pukk.com","password":"admin123456"}'

# Get dashboard
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer <token>"
```

---

## 📋 Checklist for Troubleshooting

When an issue occurs, follow this checklist:

- [ ] Check error message in console/logs
- [ ] Verify environment variables (.env file)
- [ ] Check database connection
- [ ] Restart application
- [ ] Clear node_modules and reinstall (`rm -rf node_modules && npm install`)
- [ ] Check file permissions (especially uploads directory)
- [ ] Review documentation related to the issue
- [ ] Check GitHub issues or Stack Overflow
- [ ] Create minimal reproduction case
- [ ] Enable debug logging

---

## 🆘 Getting Help

### Resources
1. **Check Documentation:**
   - README.md - Overview
   - API_DOCUMENTATION.md - API reference
   - DEPLOYMENT.md - Setup guide
   - BOT_AUTO_UPDATE.md - Bot documentation

2. **Check Code Comments:**
   - Most functions have JSDoc comments
   - Look at error handling patterns

3. **Database Help:**
   - PostgreSQL docs: https://www.postgresql.org/docs/
   - Sequelize docs: https://sequelize.org/

4. **Framework Help:**
   - Express.js: https://expressjs.com/
   - React Native: https://reactnative.dev/
   - Expo: https://docs.expo.dev/

5. **Common Issues:**
   - Check this troubleshooting guide
   - Search error message online
   - Review related GitHub issues

---

## 📞 Support Contacts

For specific issues:
- Database: PostgreSQL documentation
- Backend: Express.js & Node.js docs
- Frontend: React Native & Expo docs
- Payments: Check QRIS provider documentation
- Hosting: Check your hosting provider documentation

---

**Last Updated**: 2024
**Still need help?** Check the FAQ below ↓

---

## ❓ Frequently Asked Questions (FAQ)

### Q: How do I change the default admin password?
```bash
# Option 1: Use API
POST /api/auth/change-password
{
  "oldPassword": "admin123456",
  "newPassword": "newPassword"
}

# Option 2: Update database directly
psql -U postgres -d upkk_db
# Note: password must be bcryptjs hash
```

### Q: How do I add a new admin user?
```bash
# Use API endpoint:
POST /api/admin/karyawan  # This is for karyawan, create similar for admin
```

### Q: Can I use MySQL instead of PostgreSQL?
```javascript
// Yes! Modify config/database.js:
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql'  // Change from 'postgres'
  }
);
```

### Q: How do I deploy to Heroku?
See DEPLOYMENT.md section "Heroku Deployment"

### Q: How do I enable HTTPS?
See DEPLOYMENT.md section "SSL/HTTPS Setup"

### Q: How do I backup the database?
```bash
pg_dump -U postgres upkk_db > backup.sql
# To restore:
psql -U postgres upkk_db < backup.sql
```

### Q: How do I monitor the bot status?
Visit the admin endpoint: GET /admin/system/bot-status

### Q: Can I disable the auto-update bot?
```env
BOT_ENABLED=false
```

### Q: How do I test QRIS payments without real e-wallet?
Use mock payment in development. See BOT_AUTO_UPDATE.md for testing section.

### Q: How do I integrate real email notifications?
See DEPLOYMENT.md section "Email Integration"

### Q: What's the maximum upload file size?
Default is 5MB. Change in middleware/upload.js or .env

---

**Happy troubleshooting!** 🎉
