# PUKK - Aplikasi Smartphone Manajemen Karyawan dan Nasabah

Aplikasi smartphone yang komprehensif untuk pengelolaan karyawan, nasabah, absensi berbasis lokasi, dan pembayaran melalui QRIS.

## 🎯 Fitur Utama

### 1. **Sistem Autentikasi**
- Login Admin (Super Admin & Admin)
- Login Karyawan
- Login Nasabah
- JWT Token Authentication
- Refresh Token
- Password Management

### 2. **Admin Panel**
- Dashboard dengan statistik real-time
- Manajemen Karyawan (CRUD)
- Manajemen Lokasi Absen
- Lihat Data Pemasukan dari Semua Karyawan
- Lihat Data Nasabah
- Manajemen Pembayaran & Pencairan
- Laporan Komprehensif

### 3. **Karyawan Mobile App**
- Profil & Edit Data
- Absensi dengan GPS & Foto (Check-in/Check-out)
- Kelola Nasabah
- Generate Payment QRIS untuk Nasabah
- Konfirmasi Pembayaran
- Request Pencairan Dana
- Lihat Saldo & Riwayat Transaksi

### 4. **Nasabah**
- Input Data (NIK, Foto KTP, Data Pribadi)
- Menyimpan QRIS Code
- Riwayat Pembayaran
- Notifikasi Pembayaran

### 5. **Sistem Pembayaran QRIS**
- Generate QRIS Code dari Nasabah
- Konfirmasi Pembayaran via Foto
- Pencairan Otomatis via QRIS Nasabah
- Notifikasi Admin untuk Transfer
- Tracking Status Pembayaran

### 6. **Auto Update Bot**
- Monitoring Sistem Otomatis
- Update Otomatis dengan Rollback
- Error Handling Otomatis
- Health Check Berkala
- Notifikasi Admin

### 7. **Audit & Logging**
- Audit Trail untuk Semua Aktivitas
- System Update Tracking
- Error Logging

## 🚀 Teknologi Stack

### Backend
- **Framework**: Node.js + Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT
- **File Upload**: Multer + Sharp
- **QR Code**: QRCode Library
- **Scheduling**: node-cron, node-schedule
- **Security**: Helmet, bcryptjs, express-rate-limit

### Frontend (React Native)
- React Native
- React Navigation
- Redux/Context API
- Axios untuk HTTP Client
- React Native Camera (untuk absensi & KTP)
- React Native Maps (untuk GPS)
- React Native QR Code Scanner

## 📋 Instalasi & Setup

### Prerequisites
- Node.js >= 14
- PostgreSQL >= 12
- npm atau yarn

### 1. Setup Backend

```bash
# Clone repository
cd /workspaces/upkk-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env dengan konfigurasi database
DB_NAME=upkk_db
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# Create database
createdb upkk_db

# Run migrations (database will auto-sync)
npm run migrate

# Seed initial admin (optional)
npm run seed

# Start server
npm start
```

### 2. Setup Frontend (React Native)

```bash
# Create React Native project
npx create-expo-app pukk-mobile

cd pukk-mobile

# Install dependencies
npm install axios react-navigation react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context @react-navigation/native @react-navigation/bottom-tabs expo-location expo-camera expo-image-picker react-native-qrcode-scanner

npm start
```

## 🔌 API Endpoints

### Auth Routes (`/api/auth`)
```
POST   /admin/login              - Login Admin
POST   /karyawan/login           - Login Karyawan
POST   /change-password          - Change Password
POST   /verify-token            - Verify Token
POST   /refresh-token           - Refresh Token
```

### Admin Routes (`/api/admin`)
```
GET    /dashboard               - Get Dashboard Stats
GET    /karyawan                - Get All Karyawan
POST   /karyawan                - Create Karyawan
PUT    /karyawan/:id            - Update Karyawan
DELETE /karyawan/:id            - Delete Karyawan
POST   /lokasi-absen            - Create Lokasi Absen
GET    /lokasi-absen            - Get All Lokasi Absen
PUT    /lokasi-absen/:id        - Update Lokasi Absen
GET    /report/revenue          - Get Revenue Report
```

### Karyawan Routes (`/api/karyawan`)
```
GET    /profile                 - Get Karyawan Profile
PUT    /profile                 - Update Profile
POST   /absensi/check-in        - Check-in Absensi
POST   /absensi/check-out       - Check-out Absensi
GET    /absensi/today           - Get Today's Attendance
GET    /absensi/history         - Get Attendance History
GET    /nasabah                 - Get Nasabah List
```

### Nasabah Routes (`/api/nasabah`)
```
POST   /create                  - Create Nasabah (by Karyawan)
GET    /:id                     - Get Nasabah Detail
PUT    /:id                     - Update Nasabah
GET    /stats/summary           - Get Nasabah Statistics
GET    /search/query            - Search Nasabah
```

### Payment Routes (`/api/payment`)
```
POST   /qris/generate           - Generate Payment QRIS
POST   /qris/confirm            - Confirm Payment
GET    /history/nasabah/:id     - Get Payment History
POST   /withdrawal/request      - Create Withdrawal Request
GET    /withdrawals/pending     - Get Pending Withdrawals
POST   /withdrawals/:id/approve - Approve Withdrawal
POST   /withdrawals/:id/reject  - Reject Withdrawal
GET    /balance/karyawan        - Get Karyawan Balance
```

### Report Routes (`/api/report`)
```
GET    /revenue                 - Revenue Report
GET    /withdrawals             - Withdrawal Report
GET    /absensi-daily           - Daily Absensi Report
GET    /karyawan-performance    - Karyawan Performance Report
GET    /top-nasabah             - Top Nasabah Report
GET    /monthly-summary         - Monthly Summary Report
GET    /payment-status          - Payment Status Report
GET    /karyawan/personal-report - Karyawan Personal Report
```

## 📱 Frontend Structure

```
pukk-mobile/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   └── ForgotPasswordScreen.js
│   │   ├── admin/
│   │   │   ├── AdminDashboard.js
│   │   │   ├── KaryawanManagement.js
│   │   │   ├── NasabahManagement.js
│   │   │   ├── PaymentManagement.js
│   │   │   └── ReportsScreen.js
│   │   ├── karyawan/
│   │   │   ├── KaryawanHome.js
│   │   │   ├── AbsensiScreen.js
│   │   │   ├── NasabahListScreen.js
│   │   │   ├── AddNasabahScreen.js
│   │   │   ├── PaymentScreen.js
│   │   │   └── ProfileScreen.js
│   │   └── nasabah/
│   │       ├── NasabahHome.js
│   │       ├── PaymentHistoryScreen.js
│   │       └── ProfileScreen.js
│   ├── components/
│   │   ├── Navigation/
│   │   ├── Common/
│   │   └── Forms/
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── paymentService.js
│   │   └── locationService.js
│   ├── context/
│   │   ├── AuthContext.js
│   │   └── AppContext.js
│   ├── utils/
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── constants.js
│   └── App.js
└── package.json
```

## 🔐 Security Features

- **Password Hashing**: bcryptjs
- **JWT Authentication**: Token-based security
- **Rate Limiting**: Prevent brute force attacks
- **CORS**: Configured for security
- **Helmet**: HTTP headers security
- **File Upload Validation**: Only allowed file types
- **Input Validation**: Using joi
- **SQL Injection Prevention**: Using ORM (Sequelize)

## 🤖 Auto Update Bot Features

1. **Scheduled Checks**: Checks for updates setiap jam
2. **Automatic Rollout**: Gradual rollout dengan percentage control
3. **Error Handling**: Automatic rollback jika ada error
4. **Health Monitoring**: Monitor sistem health setiap 5 menit
5. **Notification System**: Notifikasi ke admin tentang status update
6. **Logging**: Semua update di-log dalam database

## 📊 Database Schema

### Tables:
- **Admins**: Admin users
- **Karyawans**: Employee data
- **Nasabahs**: Customer/Client data
- **Transaksis**: Transaction records
- **Absensis**: Attendance records
- **LokasiAbsens**: Attendance locations
- **PaymentQRIS**: Payment tracking
- **AuditLogs**: Activity logging
- **SystemUpdates**: Update tracking

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📝 API Documentation

Dokumentasi lengkap tersedia di Postman:
[Import Postman Collection]

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL service
sudo service postgresql status

# Create database if not exists
createdb upkk_db
```

### Port Already in Use
```bash
# Change port in .env file
PORT=5001
```

### JWT Error
```bash
# Ensure JWT_SECRET is set in .env
JWT_SECRET=your-secret-key-here
```

## 📈 Monitoring & Analytics

- Dashboard real-time dengan statistik
- Revenue tracking
- Karyawan performance metrics
- Nasabah activity
- Payment success rate
- System health status

## 🔄 Continuous Integration

Setup CI/CD pipeline dengan GitHub Actions untuk:
- Automated testing
- Linting
- Database migrations
- Deployment

## 📞 Support & Contribution

Untuk laporan bug atau feature request, silakan buat issue di repository.

## 📄 License

MIT License - Lihat LICENSE file untuk detail.

---

**Developed with ❤️ for PUKK - Bang Keliling**

Last Updated: 2024