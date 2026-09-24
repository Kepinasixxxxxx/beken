# 01. Background Job: Auto-Cancel Order Expired

Dokumen ini menjelaskan mekanisme otomatisasi pemeliharaan status transaksi (*background job / cron*) yang berjalan tanpa pemicu HTTP manual dari pengguna.

---

## 1. Mekanisme Cron Job Auto-Cancel

Sistem backend mengaktifkan cron job otomatis yang mengeksekusi pemeriksaan tabel `orders` setiap **5 menit** (`*/5 * * * *`).

* **File Job Implementation**: `src/jobs/auto-cancel-order.job.ts`
* **Frekuensi Eksekusi**: Setiap 5 Menit
* **Kriteria Pembatalan**:
  - `status`: `pending`
  - `expiredAt` $\le$ `Waktu_Sekarang (Date.now())`

---

## 2. Alur Eksekusi Otomatis

1. Job mengambil seluruh daftar transaksi berstatus `pending` yang batas waktu konfirmasinya sudah lewat (`expiredAt`).
2. Untuk setiap pesanan yang melebihi batas waktu 1 jam:
   - Status order di-update menjadi `dibatalkan` (`status: "dibatalkan"`).
   - Stok sewa pada rentang tanggal penyewaan tersebut dilepaskan kembali secara otomatis.
   - Menghasilkan record notifikasi pelanggan (`type: "ORDER_AUTO_CANCELLED"`).
3. Log eksekusi dicatat ke konsol server:
   `[JOB] Order ORD-20260925-88AB auto-cancelled.`

---

## 3. Sampel Notifikasi Yang Terkirim Ke Pelanggan

```json
{
  "recipientType": "user",
  "recipientId": "5",
  "type": "ORDER_AUTO_CANCELLED",
  "title": "Pesanan Dibatalkan Otomatis",
  "message": "Pesanan ORD-20260925-88AB telah dibatalkan otomatis karena melewati batas waktu pembayaran.",
  "relatedOrderId": "88"
}
```
