# 09. Notifikasi Pelanggan (Website Client)

Dokumen ini menjelaskan alur penerimaan notifikasi bagi pelanggan mengenai status pesanan, verifikasi pembayaran, dan pengingat pengembalian barang sewa.

---

## 1. Menampilkan Daftar Notifikasi

* **Endpoint**: `GET /api/v0/website/notifications`
* **Method**: `GET`
* **Auth**: `Authorization: Bearer <TOKEN_PELANGGAN>`

### Server Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Notifikasi berhasil diambil",
  "data": [
    {
      "id": "901",
      "recipientType": "user",
      "recipientId": "5",
      "type": "PAYMENT_VERIFIED",
      "title": "Pembayaran Terverifikasi",
      "message": "Pembayaran sebesar Rp 50.000 untuk pesanan ORD-20260925-88AB telah diverifikasi oleh admin.",
      "relatedOrderId": "88",
      "isRead": false,
      "createdAt": "2026-09-25T02:05:00.000Z"
    }
  ]
}
```

---

## 2. Tandai Notifikasi Dibaca

* **Endpoint**: `PATCH /api/v0/website/notifications/:id/read`
* **Method**: `PATCH`
* **Auth**: `Authorization: Bearer <TOKEN_PELANGGAN>`
