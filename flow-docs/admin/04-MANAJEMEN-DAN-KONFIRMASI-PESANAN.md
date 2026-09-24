# 04. Konfirmasi & Pengelolaan Pesanan (Mobile App Admin)

Dokumen ini menjelaskan alur bagi Admin untuk melihat daftar pesanan masuk dan melakukan konfirmasi terhadap pesanan `pending`.

---

## 1. Menampilkan Daftar Pesanan Masuk

* **Endpoint**: `GET /api/v0/mobile/orders`
* **Method**: `GET`
* **Auth**: `Authorization: Bearer <TOKEN_ADMIN_SITI>`
* **Query Parameters**:
  - `status`: `pending`, `dikonfirmasi`, `diproses`, `siap_diambil`, `selesai`, `dibatalkan`
  - `orderType`: `sewa`, `beli`, `custom`

---

## 2. Detail Pesanan Spesifik

* **Endpoint**: `GET /api/v0/mobile/orders/:id`
* **Method**: `GET`

---

## 3. Konfirmasi Pesanan oleh Admin

Saat pesanan berstatus `pending`, Admin melakukan konfirmasi ketersediaan barang dan menetapkan nominal DP jika diperlukan.

* **Endpoint**: `PATCH /api/v0/mobile/orders/:id/confirm`
* **Method**: `PATCH`
* **Auth**: `Authorization: Bearer <TOKEN_ADMIN_SITI>`
* **Headers**: `Content-Type: application/json`

### A. Skenario Permisalan
> Admin **Siti** mengonfirmasi pesanan sewa `#88` milik Budi dan menetapkan kewajiban DP sebesar `Rp 50.000`.

### B. Request Body
```json
{
  "dpAmount": 50000
}
```

### C. Server Response

#### 🟢 Berhasil (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Order berhasil dikonfirmasi",
  "data": {
    "id": "88",
    "orderNumber": "ORD-20260925-88AB",
    "status": "dikonfirmasi",
    "dpAmount": "50000.00"
  }
}
```

#### 🔴 Gagal: Status Bukan Pending (HTTP 400 Bad Request)
```json
{
  "success": false,
  "message": "Hanya pesanan berstatus pending yang dapat dikonfirmasi."
}
```

### D. Efek Samping Internal
1. Status order berubah ke `dikonfirmasi`.
2. Dibuat record di `order_status_history`.
3. Notifikasi terkirim ke Pelanggan Budi: *"Pesanan ORD-20260925-88AB telah dikonfirmasi oleh admin. Silakan lakukan pembayaran."*
