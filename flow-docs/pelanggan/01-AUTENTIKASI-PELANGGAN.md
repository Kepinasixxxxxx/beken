# 01. Autentikasi & Akun Pelanggan (Website Client)

Dokumen ini berisi spesifikasi API dan alur otentikasi akun **Pelanggan** pada aplikasi Website VieGuard.

---

## 1. Registrasi Akun Pelanggan Baru

* **Endpoint**: `POST /api/v0/website/auth/register`
* **Method**: `POST`
* **Auth**: Public (Tanpa Token)
* **Headers**: `Content-Type: application/json`

### Skenario Permisalan
> Pelanggan **Budi Santoso** (`budi@example.com`, No. HP: `081234567890`) membuat akun baru di website VieGuard.

### Request Body
```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "phone": "081234567890",
  "password": "Password123!"
}
```

### Server Responses

#### 🟢 Berhasil (HTTP 201 Created)
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": "5",
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "phone": "081234567890",
      "createdAt": "2026-09-25T01:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.accessTokenBudi...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refreshTokenBudi..."
  }
}
```

#### 🔴 Gagal: Email Sudah Terdaftar (HTTP 409 Conflict)
```json
{
  "success": false,
  "message": "Email sudah terdaftar."
}
```

#### 🔴 Gagal: Validasi Gagal (HTTP 400 Bad Request)
```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": [
    {
      "field": "email",
      "message": "Format email tidak valid"
    }
  ]
}
```

---

## 2. Login Pelanggan

* **Endpoint**: `POST /api/v0/website/auth/login`
* **Method**: `POST`
* **Auth**: Public (Tanpa Token)

### Request Body
```json
{
  "email": "budi@example.com",
  "password": "Password123!"
}
```

### Server Responses

#### 🟢 Berhasil (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "5",
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "phone": "081234567890"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.accessTokenBudi...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refreshTokenBudi..."
  }
}
```

#### 🔴 Gagal: Kredensial Salah (HTTP 401 Unauthorized)
```json
{
  "success": false,
  "message": "Email atau password salah."
}
```

---

## 3. Pembaruan Token (Refresh Token)

* **Endpoint**: `POST /api/v0/website/auth/refresh`
* **Method**: `POST`

### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refreshTokenBudi..."
}
```

### Server Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Token berhasil diperbarui",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.newAccessToken..."
  }
}
```

---

## 4. Lupa & Reset Password

* **Lupa Password**: `POST /api/v0/website/auth/forgot-password` (Mengirimkan kode OTP ke email)
* **Reset Password**: `POST /api/v0/website/auth/reset-password` (Mengubah password dengan OTP)

---

## 5. Profil Saya (User Profile)

* **Get Profil**: `GET /api/v0/website/users/profile`
* **Update Profil**: `PUT /api/v0/website/users/profile`
* **Auth Required**: `Authorization: Bearer <TOKEN_PELANGGAN>`
