# 11. Manajemen Profil Toko & Admin Staff (Mobile App Admin)

Dokumen ini menjelaskan alur pengelolaan data toko (alamat, nomor HP, jam operasional, koordinat) serta pembuatan akun staff Admin baru oleh Owner.

---

## 1. Menampilkan & Mengubah Profil Toko

* **Get Profil Toko**: `GET /api/v0/mobile/store-profile`
* **Update Profil Toko**: `PUT /api/v0/mobile/store-profile`
* **Method**: `PUT`
* **Auth**: `Authorization: Bearer <TOKEN_ADMIN_OWNER>`
* **Headers**: `Content-Type: application/json`

### Request Body
```json
{
  "storeName": "VieGuard Medis Store Pusat",
  "description": "Pusat Penyewaan dan Penjualan APD & Peralatan Medis Terpercaya.",
  "address": "Jl. Kesehatan No. 45, Jakarta Selatan",
  "phone": "021-5551234",
  "whatsappNumber": "6281234567890",
  "operationalHours": "Senin - Sabtu: 08:00 - 17:00 WIB",
  "latitude": -6.2088,
  "longitude": 106.8456
}
```

### Server Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Profil toko berhasil diperbarui",
  "data": {
    "id": "1",
    "storeName": "VieGuard Medis Store Pusat",
    "updatedAt": "2026-09-25T01:00:00.000Z"
  }
}
```

---

## 2. Manajemen Pengguna Admin Staff (Role: Owner)

* **Daftar Staff**: `GET /api/v0/mobile/admins`
* **Tambah Staff Baru**: `POST /api/v0/mobile/admins`
* **Hapus Staff**: `DELETE /api/v0/mobile/admins/:id`
