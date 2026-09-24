# 06. Riwayat & Detail Pesanan (Website Client)

Dokumen ini menjelaskan alur bagi pelanggan untuk mengecek daftar riwayat transaksi, rincian pesanan, dan grafik *progress* status pengerjaan.

---

## 1. Menampilkan Daftar Pesanan Saya

* **Endpoint**: `GET /api/v0/website/orders`
* **Method**: `GET`
* **Auth**: `Authorization: Bearer <TOKEN_PELANGGAN>`

### Server Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Daftar pesanan berhasil diambil",
  "data": [
    {
      "id": "88",
      "orderNumber": "ORD-20260925-88AB",
      "orderType": "sewa",
      "status": "dikonfirmasi",
      "totalPrice": "150000.00",
      "dpAmount": "50000.00",
      "isLunas": false,
      "createdAt": "2026-09-25T01:54:25.000Z",
      "items": [ ... ],
      "rental": { ... },
      "payments": [ ... ]
    }
  ]
}
```

---

## 2. Detail Pesanan Spesifik

* **Endpoint**: `GET /api/v0/website/orders/:id`
* **Method**: `GET`
* **Auth**: `Authorization: Bearer <TOKEN_PELANGGAN>`

---

## 3. Menampilkan Riwayat Perkembangan Progress (Status History)

Pelanggan dapat melihat histori garis waktu (*timeline*) perubahan status pesanan.

* **Endpoint**: `GET /api/v0/website/orders/:id/status-history`
* **Method**: `GET`
* **Auth**: `Authorization: Bearer <TOKEN_PELANGGAN>`

### Server Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Riwayat status pesanan berhasil diambil",
  "data": [
    {
      "id": "1",
      "orderId": "88",
      "progressPercentage": 0,
      "statusLabel": "Pesanan Dikonfirmasi Admin",
      "note": "Admin telah mengonfirmasi pesanan.",
      "createdAt": "2026-09-25T02:00:00.000Z"
    },
    {
      "id": "2",
      "orderId": "88",
      "progressPercentage": 50,
      "statusLabel": "Pencucian & Sterilisasi UV",
      "note": "Jas APD sedang disterilisasi sebelum dikemas.",
      "createdAt": "2026-09-25T03:00:00.000Z"
    }
  ]
}
```
