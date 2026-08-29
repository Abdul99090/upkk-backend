# PUKK API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Semua endpoint memerlukan JWT token di header (kecuali login & register):
```
Authorization: Bearer <your_jwt_token>
```

---

## 📌 Authentication Endpoints

### Login Admin
```
POST /auth/admin/login
```

**Request:**
```json
{
  "email": "admin@pukk.com",
  "password": "admin123456"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Admin PUKK",
    "email": "admin@pukk.com",
    "role": "super_admin"
  }
}
```

### Login Karyawan
```
POST /auth/karyawan/login
```

**Request:**
```json
{
  "email": "karyawan@pukk.com",
  "password": "karyawan123456"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "karyawan-id",
    "name": "John Doe",
    "email": "karyawan@pukk.com",
    "position": "Sales Officer"
  }
}
```

### Change Password
```
POST /auth/change-password
Authorization: Bearer <token>
```

**Request:**
```json
{
  "oldPassword": "current_password",
  "newPassword": "new_password",
  "confirmPassword": "new_password"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

### Verify Token
```
POST /auth/verify-token
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Token is valid",
  "user": {
    "id": "user-id",
    "email": "user@email.com",
    "role": "admin",
    "type": "admin"
  }
}
```

### Refresh Token
```
POST /auth/refresh-token
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Token refreshed",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 👨‍💼 Admin Endpoints

### Get Dashboard Statistics
```
GET /admin/dashboard
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "totalKaryawan": 15,
  "totalNasabah": 45,
  "totalRevenue": 125000000,
  "totalWithdrawals": 50000000,
  "pendingPayments": 5
}
```

### Get All Karyawan
```
GET /admin/karyawan?page=1&limit=10&search=john&status=active
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 10)
- `search` (string): Search by name, email, or NIK
- `status` (string): Filter by status (active, inactive, suspended)

**Response (200):**
```json
{
  "data": [
    {
      "id": "karyawan-id",
      "name": "John Doe",
      "email": "john@email.com",
      "phone": "08123456789",
      "nik": "3172051234567890",
      "position": "Sales Officer",
      "salary": 5000000,
      "status": "active",
      "lastLogin": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

### Create Karyawan
```
POST /admin/karyawan
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Form Data:**
```
name: John Doe
email: john@email.com
password: password123
phone: 08123456789
nik: 3172051234567890
position: Sales Officer
salary: 5000000
bankName: BCA
bankAccount: 12345678901
profilePhoto: <file>
```

**Response (201):**
```json
{
  "message": "Karyawan created successfully",
  "data": {
    "id": "karyawan-id",
    "name": "John Doe",
    "email": "john@email.com",
    ...
  }
}
```

### Update Karyawan
```
PUT /admin/karyawan/:id
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Response (200):**
```json
{
  "message": "Karyawan updated successfully",
  "data": { ... }
}
```

### Delete Karyawan
```
DELETE /admin/karyawan/:id
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "message": "Karyawan deleted successfully"
}
```

### Create Lokasi Absen
```
POST /admin/lokasi-absen
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "name": "Kantor Pusat Jakarta",
  "latitude": "-6.1751",
  "longitude": "106.8650",
  "radius": 100,
  "address": "Jl. Sudirman, Jakarta Pusat",
  "city": "Jakarta",
  "province": "DKI Jakarta",
  "checkInTime": "08:00",
  "checkOutTime": "17:00",
  "workingDays": [1, 2, 3, 4, 5]
}
```

**Response (201):**
```json
{
  "message": "Lokasi absen created successfully",
  "data": { ... }
}
```

### Get All Lokasi Absen
```
GET /admin/lokasi-absen
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "lokasi-id",
      "name": "Kantor Pusat Jakarta",
      "latitude": "-6.1751",
      "longitude": "106.8650",
      ...
    }
  ]
}
```

### Update Lokasi Absen
```
PUT /admin/lokasi-absen/:id
Authorization: Bearer <admin_token>
```

---

## 👥 Karyawan Endpoints

### Get Karyawan Profile
```
GET /karyawan/profile
Authorization: Bearer <karyawan_token>
```

**Response (200):**
```json
{
  "data": {
    "id": "karyawan-id",
    "name": "John Doe",
    "email": "john@email.com",
    "phone": "08123456789",
    "position": "Sales Officer",
    "salary": 5000000,
    "bankName": "BCA",
    "bankAccount": "12345678901"
  }
}
```

### Update Karyawan Profile
```
PUT /karyawan/profile
Authorization: Bearer <karyawan_token>
Content-Type: multipart/form-data
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "data": { ... }
}
```

### Check-in Absensi
```
POST /karyawan/absensi/check-in
Authorization: Bearer <karyawan_token>
Content-Type: multipart/form-data
```

**Form Data:**
```
lokasiAbsenId: "lokasi-id"
latitude: "-6.1751"
longitude": "106.8650"
photo: <file>
```

**Response (201):**
```json
{
  "message": "Check-in successful",
  "data": {
    "id": "absensi-id",
    "karyawanId": "karyawan-id",
    "checkInTime": "2024-01-15T08:30:00Z",
    "status": "on_time",
    "distance": 45
  }
}
```

### Check-out Absensi
```
POST /karyawan/absensi/check-out
Authorization: Bearer <karyawan_token>
Content-Type: multipart/form-data
```

**Form Data:**
```
absensiId: "absensi-id"
latitude: "-6.1751"
longitude: "106.8650"
photo: <file>
```

**Response (200):**
```json
{
  "message": "Check-out successful",
  "data": { ... }
}
```

### Get Today's Attendance
```
GET /karyawan/absensi/today
Authorization: Bearer <karyawan_token>
```

**Response (200):**
```json
{
  "data": {
    "id": "absensi-id",
    "checkInTime": "2024-01-15T08:30:00Z",
    "checkOutTime": null,
    "status": "on_time",
    "lokasiAbsen": {
      "id": "lokasi-id",
      "name": "Kantor Pusat Jakarta",
      "address": "Jl. Sudirman, Jakarta Pusat"
    }
  }
}
```

### Get Attendance History
```
GET /karyawan/absensi/history?page=1&limit=10&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <karyawan_token>
```

**Response (200):**
```json
{
  "data": [ ... ],
  "pagination": { ... }
}
```

### Get Nasabah List
```
GET /karyawan/nasabah?page=1&limit=10&search=budi&status=active
Authorization: Bearer <karyawan_token>
```

---

## 🧑‍🤝‍🧑 Nasabah Endpoints

### Create Nasabah
```
POST /nasabah/create
Authorization: Bearer <karyawan_token>
Content-Type: multipart/form-data
```

**Form Data:**
```
name: Budi Santoso
nik: 3172021234567890
phone: 08123456789
email: budi@email.com
address: Jl. Merdeka 123
city: Jakarta
province: DKI Jakarta
bankName: BNI
bankAccount: 0987654321
qrisCode: <qris_code>
occupancy: Wiraswasta
maritalStatus: married
monthlyIncome: 2500000
ktpPhoto: <file>
profilePhoto: <file>
```

**Response (201):**
```json
{
  "message": "Nasabah created successfully",
  "data": { ... }
}
```

### Get Nasabah Detail
```
GET /nasabah/:id
Authorization: Bearer <token>
```

### Update Nasabah
```
PUT /nasabah/:id
Authorization: Bearer <karyawan_token>
Content-Type: multipart/form-data
```

### Get Nasabah Statistics
```
GET /nasabah/stats/summary
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "total": 50,
  "active": 45,
  "inactive": 3,
  "suspended": 2,
  "topKaryawan": [
    {
      "karyawanId": "karyawan-id",
      "totalNasabah": 15,
      "totalIncome": 50000000
    }
  ]
}
```

### Search Nasabah
```
GET /nasabah/search/query?q=budi&type=all
Authorization: Bearer <token>
```

---

## 💳 Payment Endpoints

### Generate Payment QRIS
```
POST /payment/qris/generate
Authorization: Bearer <karyawan_token>
```

**Request:**
```json
{
  "nasabahId": "nasabah-id",
  "amount": 500000,
  "description": "Payment for services"
}
```

**Response (200):**
```json
{
  "message": "Payment QRIS generated successfully",
  "data": {
    "transactionId": "transaction-id",
    "paymentId": "payment-id",
    "qrImage": "data:image/png;base64,...",
    "amount": 500000,
    "expiresAt": "2024-01-15T09:15:00Z"
  }
}
```

### Confirm Payment
```
POST /payment/qris/confirm
Authorization: Bearer <karyawan_token>
Content-Type: multipart/form-data
```

**Form Data:**
```
paymentId: payment-id
proofPhoto: <file>
```

**Response (200):**
```json
{
  "message": "Payment confirmed successfully",
  "data": { ... }
}
```

### Get Payment History
```
GET /payment/history/nasabah/:nasabahId?page=1&limit=10
Authorization: Bearer <token>
```

### Create Withdrawal Request
```
POST /payment/withdrawal/request
Authorization: Bearer <karyawan_token>
```

**Request:**
```json
{
  "amount": 1000000,
  "notes": "Weekly withdrawal"
}
```

**Response (201):**
```json
{
  "message": "Withdrawal request created successfully",
  "data": { ... }
}
```

### Get Pending Withdrawals
```
GET /payment/withdrawals/pending?page=1&limit=10
Authorization: Bearer <admin_token>
```

### Approve Withdrawal
```
POST /payment/withdrawals/:id/approve
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Response (200):**
```json
{
  "message": "Withdrawal approved successfully",
  "data": { ... }
}
```

### Reject Withdrawal
```
POST /payment/withdrawals/:id/reject
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "reason": "Insufficient balance"
}
```

### Get Karyawan Balance
```
GET /payment/balance/karyawan
Authorization: Bearer <karyawan_token>
```

**Response (200):**
```json
{
  "totalEarnings": 5000000,
  "totalWithdrawals": 2000000,
  "pendingWithdrawals": 500000,
  "balance": 3000000,
  "availableBalance": 2500000
}
```

---

## 📊 Report Endpoints

### Get Revenue Report
```
GET /report/revenue?startDate=2024-01-01&endDate=2024-01-31&karyawanId=optional
Authorization: Bearer <admin_token>
```

### Get Withdrawal Report
```
GET /report/withdrawals?startDate=2024-01-01&endDate=2024-01-31&status=completed
Authorization: Bearer <admin_token>
```

### Get Daily Absensi Report
```
GET /report/absensi-daily?date=2024-01-15
Authorization: Bearer <admin_token>
```

### Get Karyawan Performance Report
```
GET /report/karyawan-performance?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <admin_token>
```

### Get Top Nasabah Report
```
GET /report/top-nasabah?limit=20
Authorization: Bearer <admin_token>
```

### Get Monthly Summary Report
```
GET /report/monthly-summary?year=2024
Authorization: Bearer <admin_token>
```

### Get Payment Status Report
```
GET /report/payment-status
Authorization: Bearer <admin_token>
```

### Get Karyawan Personal Report
```
GET /report/karyawan/personal-report
Authorization: Bearer <karyawan_token>
```

---

## Error Response Format

Semua error responses mengikuti format ini:

```json
{
  "message": "Error description",
  "error": {}
}
```

### Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Rate Limiting
- Limit: 100 requests per 15 minutes per IP
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

## File Upload Limits
- Max file size: 5MB
- Allowed types: JPEG, PNG, GIF, PDF

---

**Last Updated**: 2024
