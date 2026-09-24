# 02. Integrasi Webhook Midtrans Payment Gateway

Dokumen ini menjelaskan alur penerimaan sinyal callback/notification HTTP dari server Midtrans Gateway secara otomatis.

---

## 1. Gateway Callback Notification Endpoint

* **Endpoint**: `POST /api/v0/webhooks/midtrans`
* **Method**: `POST`
* **Auth**: Public (Validasi Signature Key Internal)
* **Headers**: `Content-Type: application/json`

---

## 2. Contoh JSON Payload dari Server Midtrans

```json
{
  "transaction_time": "2026-09-25 02:00:00",
  "transaction_status": "settlement",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "a823f0...",
  "payment_type": "gopay",
  "order_id": "ORD-20260925-88AB-DP",
  "gross_amount": "50000.00",
  "currency": "IDR",
  "transaction_id": "98234-ab-4921"
}
```

---

## 3. Logika Pemrosesan Internal Server (`MidtransWebhookService`)

1. Backend menerima payload webhook dari Midtrans.
2. Server mencocokkan `order_id` dan memvalidasi `signature_key`.
3. Jika `transaction_status` = `settlement` atau `capture`:
   - Dibuat record pembayaran terverifikasi otomatis.
   - Evaluasi kelunasan order dijalankan.
   - Status order diperbarui ke `diproses` atau `siap_diambil`.
   - Disampaikan notifikasi ke pelanggan dan admin toko.
4. Server membalas HTTP 200 OK ke Midtrans.

### Server Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Midtrans notification processed"
}
```
