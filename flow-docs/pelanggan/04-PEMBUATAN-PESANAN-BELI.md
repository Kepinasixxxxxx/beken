# 04. Pembuatan Pesanan Beli (Website Client)

Dokumen ini menjelaskan alur pembelian barang secara permanen (**`orderType: "beli"`**) oleh pelanggan di website VieGuard.

---

## 1. Checkout Order Beli

* **Endpoint**: `POST /api/v0/website/orders`
* **Method**: `POST`
* **Auth**: `Authorization: Bearer <TOKEN_PELANGGAN>`
* **Headers**: `Content-Type: application/json`

### A. Skenario Permisalan
> **Budi** membeli 2 unit **Jas APD Medis (Size L)** seharga `Rp 350.000` / unit dan 1 box **Sarung Tangan Latex** seharga `Rp 85.000`. Total transaksi: `Rp 785.000`.

### B. Request Body
```json
{
  "orderType": "beli",
  "requiresProduction": false,
  "notes": "Tolong dipacking peti kayu jika dikirim via kargo.",
  "items": [
    {
      "itemType": "product",
      "productId": 12,
      "productVariantId": 34,
      "quantity": 2,
      "size": "L",
      "unitPrice": 350000
    },
    {
      "itemType": "accessory",
      "accessoryId": 5,
      "quantity": 1,
      "unitPrice": 85000
    }
  ]
}
```

### C. Server Response

#### 🟢 Berhasil (HTTP 201 Created)
```json
{
  "success": true,
  "message": "Pesanan berhasil dibuat",
  "data": {
    "id": "89",
    "userId": "5",
    "orderNumber": "ORD-20260925-89CD",
    "orderType": "beli",
    "status": "pending",
    "totalPrice": "785000.00",
    "expiredAt": "2026-09-25T02:54:25.000Z",
    "items": [
      {
        "id": "121",
        "orderId": "89",
        "itemType": "product",
        "productId": "12",
        "productVariantId": "34",
        "quantity": 2,
        "unitPrice": "350000.00",
        "subtotal": "700000.00"
      },
      {
        "id": "122",
        "orderId": "89",
        "itemType": "accessory",
        "accessoryId": "5",
        "quantity": 1,
        "unitPrice": "85000.00",
        "subtotal": "85000.00"
      }
    ]
  }
}
```
