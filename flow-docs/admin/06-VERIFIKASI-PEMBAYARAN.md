# 06. Verifikasi Pembayaran (Mobile App Admin)

Dokumen ini menjelaskan alur verifikasi transfer pembayaran manual oleh Admin toko.

---

## 1. Menampilkan Daftar Pembayaran Masuk

* **Endpoint**: `GET /api/v0/mobile/payments`
* **Method**: `GET`
* **Auth**: `Authorization: Bearer <TOKEN_ADMIN_SITI>`
* **Query Parameters**:
  - `status`: `menunggu`, `terverifikasi`, `ditolak`

---

## 2. Verifikasi Pembayaran (Terverifikasi / Ditolak)

* **Endpoint**: `PATCH /api/v0/mobile/payments/:id/verify`
* **Method**: `PATCH`
* **Auth**: `Authorization: Bearer <TOKEN_ADMIN_SITI>`
* **Headers**: `Content-Type: application/json`

---

### Skenario A: Pembayaran TERVERIFIKASI

#### Request Body
```json
{
  "status": "terverifikasi"
}
```

#### Logika Evaluasi Kelunasan Internal Backend:
1. Status pembayaran berubah menjadi `terverifikasi`.
2. Backend menghitung total pembayaran terverifikasi untuk order tersebut.
3. Jika total terbayar $\ge$ total harga order -> `isLunas = true`.
4. Status order otomatis diperbarui ke `diproses` atau `siap_diambil`.
5. Notifikasi terkirim ke Pelanggan: *"Pembayaran sebesar Rp 50.000 untuk pesanan ORD-XXXX telah diverifikasi."*

#### 🟢 Server Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Pembayaran berhasil diverifikasi",
  "data": {
    "id": "201",
    "orderId": "88",
    "status": "terverifikasi",
    "verifiedBy": "1",
    "verifiedAt": "2026-09-25T02:05:00.000Z"
  }
}
```

---

### Skenario B: Pembayaran DITOLAK

#### Request Body
```json
{
  "status": "ditolak",
  "refundReason": "Foto bukti bayar blur dan dana tidak ada di mutasi BCA."
}
```

#### 🔴 Server Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Pembayaran berhasil diverifikasi",
  "data": {
    "id": "201",
    "status": "ditolak",
    "refundReason": "Foto bukti bayar blur dan dana tidak ada di mutasi BCA."
  }
}
```
