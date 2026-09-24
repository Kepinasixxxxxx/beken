# 10. Notifikasi & Laporan Keuangan (Mobile App Admin)

Dokumen ini menjelaskan alur penerimaan notifikasi operasional serta ekspor ringkasan laporan keuangan/pendapatan sewa oleh Admin.

---

## 1. Menampilkan Notifikasi Admin

* **Endpoint**: `GET /api/v0/mobile/notifications`
* **Method**: `GET`
* **Auth**: `Authorization: Bearer <TOKEN_ADMIN_SITI>`

### Server Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Notifikasi berhasil diambil",
  "data": [
    {
      "id": "801",
      "recipientType": "admin",
      "recipientId": "1",
      "type": "ORDER_NEW",
      "title": "Pesanan Baru Diterima",
      "message": "Pesanan ORD-20260925-88AB (sewa) telah dibuat oleh pelanggan.",
      "relatedOrderId": "88",
      "isRead": false,
      "createdAt": "2026-09-25T01:54:25.000Z"
    }
  ]
}
```

---

## 2. Ringkasan Laporan Pendapatan & Sewa

* **Endpoint**: `GET /api/v0/mobile/reports/summary`
* **Method**: `GET`
* **Auth**: `Authorization: Bearer <TOKEN_ADMIN_SITI>`
* **Query Parameters**:
  - `startDate`: `2026-09-01`
  - `endDate`: `2026-09-30`

### Server Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Laporan berhasil diambil",
  "data": {
    "totalRevenue": "15450000.00",
    "totalOrders": 35,
    "completedRentals": 28,
    "activeRentals": 7
  }
}
```
