# 07. Kalender & Operasional Sewa (Mobile App Admin)

Dokumen ini menjelaskan alur pemantauan jadwal sewa dan serah terima barang sewa di toko (**Pickup**).

---

## 1. Kalender Booking Sewa

Admin dapat memantau jadwal penyewaan unit harian/bulanan.

* **Endpoint**: `GET /api/v0/mobile/rentals/calendar`
* **Method**: `GET`
* **Auth**: `Authorization: Bearer <TOKEN_ADMIN_SITI>`
* **Query Parameters**:
  - `startDate`: `2026-10-01`
  - `endDate`: `2026-10-31`

### Server Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Kalender sewa berhasil diambil",
  "data": [
    {
      "id": "45",
      "orderId": "88",
      "pickupDate": "2026-10-01T00:00:00.000Z",
      "returnDate": "2026-10-03T00:00:00.000Z",
      "status": "dipesan",
      "order": {
        "user": {
          "name": "Budi Santoso",
          "phone": "081234567890"
        }
      }
    }
  ]
}
```

---

## 2. Serah Terima Pengambilan Barang (Pickup)

Pada hari H penyewaan, Admin mencatat kondisi fisik barang dan mengubah status sewa menjadi `diambil`.

* **Endpoint**: `PATCH /api/v0/mobile/rentals/:id/status`
* **Method**: `PATCH`
* **Auth**: `Authorization: Bearer <TOKEN_ADMIN_SITI>`
* **Headers**: `Content-Type: application/json`

### A. Request Body
```json
{
  "status": "diambil",
  "itemConditionBefore": "Jas APD bersih steril, resleting 100% berfungsi normal."
}
```

### B. Server Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Status sewa berhasil diperbarui",
  "data": {
    "id": "45",
    "status": "diambil",
    "itemConditionBefore": "Jas APD bersih steril, resleting 100% berfungsi normal."
  }
}
```
