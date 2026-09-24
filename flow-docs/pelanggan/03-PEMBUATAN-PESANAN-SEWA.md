# 03. Pembuatan Pesanan Sewa (Website Client)

Dokumen ini menjelaskan alur pembuatan transaksi **Sewa (`orderType: "sewa"`)** oleh pelanggan di website, termasuk logika internal ketersediaan stok sewa bentrok tanggal (`checkRentalAvailability`).

---

## 1. Checkout Order Sewa

* **Endpoint**: `POST /api/v0/website/orders`
* **Method**: `POST`
* **Auth**: `Authorization: Bearer <TOKEN_PELANGGAN>`
* **Headers**: `Content-Type: application/json`

### A. Skenario Permisalan
> **Budi** menyewa **Jas APD Medis (Size L)** untuk tanggal pengambilan `2026-10-01` dan tanggal pengembalian `2026-10-03`.

### B. Request Body
```json
{
  "orderType": "sewa",
  "requiresProduction": false,
  "notes": "Mohon disiapkan terbungkus rapi.",
  "items": [
    {
      "itemType": "product",
      "productId": 12,
      "productVariantId": 34,
      "quantity": 1,
      "size": "L",
      "unitPrice": 150000
    }
  ],
  "rentalDetail": {
    "pickupDate": "2026-10-01",
    "returnDate": "2026-10-03"
  }
}
```

### C. Logika Internal Pengecekan Stok Bentrok (`checkRentalAvailability`)
1. Backend mengambil `stockRent` untuk varian ID 34 (Total stok sewa: `2 unit`).
2. Backend menghitung transaksi lain yang aktif (bukan status `dibatalkan`) yang penyewaannya bentrok:
   $$\text{rental.pickupDate} \le \text{returnDate} \quad \text{AND} \quad \text{rental.returnDate} \ge \text{pickupDate}$$
3. Jika $\text{stockRent} - \text{bookedCount} \ge \text{quantityRequested}$, pesanan berhasil diproses.
4. Status awal diset: `pending`, nomor order `orderNumber` di-generate, dan `expiredAt` ditetapkan (1 jam ke depan).

### D. Server Responses

#### 🟢 Berhasil (HTTP 201 Created)
```json
{
  "success": true,
  "message": "Pesanan berhasil dibuat",
  "data": {
    "id": "88",
    "userId": "5",
    "orderNumber": "ORD-20260925-88AB",
    "orderType": "sewa",
    "status": "pending",
    "totalPrice": "150000.00",
    "expiredAt": "2026-09-25T02:54:25.000Z",
    "rental": {
      "id": "45",
      "orderId": "88",
      "pickupDate": "2026-10-01T00:00:00.000Z",
      "returnDate": "2026-10-03T00:00:00.000Z",
      "status": "dipesan"
    }
  }
}
```

#### 🔴 Gagal: Stok Sewa Bentrok/Habis (HTTP 400 Bad Request)
```json
{
  "success": false,
  "message": "Stok sewa tidak mencukupi untuk tanggal 2026-10-01 s/d 2026-10-03"
}
```

#### 🔴 Gagal: Tanggal Sewa Belum Diisi (HTTP 400 Bad Request)
```json
{
  "success": false,
  "message": "Detail tanggal sewa (pickupDate & returnDate) wajib diisi untuk sewa."
}
```
