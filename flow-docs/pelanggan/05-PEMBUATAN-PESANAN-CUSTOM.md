# 05. Pembuatan Pesanan Custom (Website Client)

Dokumen ini menjelaskan alur pembuatan pemesanan pakaian/peralatan medis khusus secara kustom (**`orderType: "custom"`**) yang membutuhkan proses produksi terlebih dahulu (`requiresProduction: true`).

---

## 1. Checkout Order Custom

* **Endpoint**: `POST /api/v0/website/orders`
* **Method**: `POST`
* **Auth**: `Authorization: Bearer <TOKEN_PELANGGAN>`
* **Headers**: `Content-Type: application/json`

### A. Skenario Permisalan
> **Budi** memesan seragam medis kustom sebanyak 50 stel dengan bordir logo klinik dan spesifikasi khusus.

### B. Request Body
```json
{
  "orderType": "custom",
  "requiresProduction": true,
  "notes": "Pesanan baju seragam medis custom logo klinik.",
  "items": [
    {
      "itemType": "product",
      "productId": 12,
      "quantity": 50,
      "unitPrice": 250000
    }
  ],
  "customDetail": {
    "designReference": "/uploads/custom/design-ref-1.jpg",
    "designDescription": "Baju medis warna biru navy dengan bordir nama klinik di dada kiri.",
    "jenisJenjang": "Klinik Pratama",
    "consultationNote": "Sudah konsultasi via WhatsApp dengan Admin Siti."
  }
}
```

### C. Server Response (HTTP 201 Created)
```json
{
  "success": true,
  "message": "Pesanan berhasil dibuat",
  "data": {
    "id": "90",
    "userId": "5",
    "orderNumber": "ORD-20260925-90EF",
    "orderType": "custom",
    "requiresProduction": true,
    "status": "pending",
    "totalPrice": "12500000.00",
    "customOrderDetail": {
      "id": "12",
      "orderId": "90",
      "designReference": "/uploads/custom/design-ref-1.jpg",
      "designDescription": "Baju medis warna biru navy dengan bordir nama klinik di dada kiri.",
      "jenisJenjang": "Klinik Pratama",
      "consultationNote": "Sudah konsultasi via WhatsApp dengan Admin Siti."
    }
  }
}
```
