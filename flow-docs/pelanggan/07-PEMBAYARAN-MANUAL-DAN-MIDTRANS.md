# 07. Pembayaran Manual & Midtrans (Website Client)

Dokumen ini menjelaskan alur pengunggahan bukti pembayaran transfer manual oleh pelanggan.

---

## 1. Unggah Bukti Transfer Manual

Setelah pesanan dikonfirmasi oleh Admin, pelanggan melakukan transfer dan mengunggah foto/file bukti transfer.

* **Endpoint**: `POST /api/v0/website/payments/proof`
* **Method**: `POST`
* **Auth**: `Authorization: Bearer <TOKEN_PELANGGAN>`
* **Headers**: `Content-Type: multipart/form-data`

### A. Skenario Permisalan
> **Budi** mengunggah foto struk transfer pembayaran DP sebesar `Rp 50.000` via transfer BCA.

### B. Form-Data Payload
- `orderId`: `88`
- `paymentType`: `dp` *(Opsi: "dp", "pelunasan", "refund")*
- `amount`: `50000`
- `paymentMethod`: `manual_transfer_bca`
- `proofImage`: *(File foto/gambar struk transfer)*

### C. Server Response

#### 🟢 Berhasil (HTTP 201 Created)
```json
{
  "success": true,
  "message": "Bukti pembayaran berhasil diunggah",
  "data": {
    "id": "201",
    "orderId": "88",
    "paymentType": "dp",
    "amount": "50000.00",
    "paymentMethod": "manual_transfer_bca",
    "proofImage": "/uploads/payments/proof-1727229265.jpg",
    "status": "menunggu",
    "createdAt": "2026-09-25T02:00:00.000Z"
  }
}
```

#### 🔴 Gagal: Pesanan Tidak Ditemukan / Bukan Milik User (HTTP 404 Not Found)
```json
{
  "success": false,
  "message": "Pesanan tidak ditemukan."
}
```
