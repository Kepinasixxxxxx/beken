# 01. Autentikasi Admin (Mobile App Admin)

Dokumen ini menjelaskan alur masuk (*login*) dan otentikasi sesi untuk **Admin Toko** pada aplikasi Mobile Admin VieGuard.

---

## 1. Login Admin Toko

* **Endpoint**: `POST /api/v0/mobile/auth/login`
* **Method**: `POST`
* **Auth**: Public (Tanpa Token)
* **Headers**: `Content-Type: application/json`

### A. Skenario Permisalan
> Admin **Siti Aminah** (`admin.siti@vieguard.com`) memasukkan kredensial login pada aplikasi Android Admin.

### B. Request Body
```json
{
  "email": "admin.siti@vieguard.com",
  "password": "AdminSecurePassword123!"
}
```

### C. Server Responses

#### 🟢 Berhasil (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Login admin berhasil",
  "data": {
    "admin": {
      "id": "1",
      "name": "Siti Aminah",
      "email": "admin.siti@vieguard.com",
      "role": "staff"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.accessTokenAdmin...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refreshTokenAdmin..."
  }
}
```

#### 🔴 Gagal: Password / Email Salah (HTTP 401 Unauthorized)
```json
{
  "success": false,
  "message": "Email atau password admin salah."
}
```

---

## 2. Refresh Token Admin

* **Endpoint**: `POST /api/v0/mobile/auth/refresh`
* **Method**: `POST`

### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refreshTokenAdmin..."
}
```

---

## 3. Profile Admin Akun Saya

* **Endpoint**: `GET /api/v0/mobile/account/profile`
* **Auth**: `Authorization: Bearer <TOKEN_ADMIN_SITI>`
