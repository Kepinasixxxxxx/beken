# 📚 Dokumentasi Terstruktur Sistem & API VieGuard

Dokumentasi ini telah dipisahkan secara rapi ke dalam folder-folder terpisah berdasarkan **Aplikasi Pelanggan (Website)**, **Aplikasi Admin (Mobile)**, dan **Integrasi Sistem Backend**.

---

## 🗂️ Struktur Direktori Dokumentasi

```
documentations/
├── README.md
├── pelanggan/                 <-- Dokumentasi khusus Website Client / Pelanggan
│   ├── 01-AUTENTIKASI-PELANGGAN.md
│   ├── 02-KATALOG-PRODUK-DAN-AKSESORI.md
│   ├── 03-PEMBUATAN-PESANAN-SEWA.md
│   ├── 04-PEMBUATAN-PESANAN-BELI.md
│   ├── 05-PEMBUATAN-PESANAN-CUSTOM.md
│   ├── 06-RIWAYAT-DAN-DETAIL-PESANAN.md
│   ├── 07-PEMBAYARAN-MANUAL-DAN-MIDTRANS.md
│   ├── 08-LIVE-CHAT-PELANGGAN.md
│   ├── 09-NOTIFIKASI-PELANGGAN.md
│   └── 10-ULASAN-DAN-TESTIMONIAL.md
│
├── admin/                     <-- Dokumentasi khusus Mobile App Admin / Staff Toko
│   ├── 01-AUTENTIKASI-ADMIN.md
│   ├── 02-MANAJEMEN-PRODUK-DAN-KATEGORI.md
│   ├── 03-MANAJEMEN-AKSESORI.md
│   ├── 04-MANAJEMEN-DAN-KONFIRMASI-PESANAN.md
│   ├── 05-TRACKING-PROGRESS-PENGERJAAN.md
│   ├── 06-VERIFIKASI-PEMBAYARAN.md
│   ├── 07-KALENDER-DAN-OPERASIONAL-SEWA.md
│   ├── 08-PENGEMBALIAN-DAN-DENDA-KERUSAKAN.md
│   ├── 09-LIVE-CHAT-ADMIN.md
│   ├── 10-NOTIFIKASI-DAN-PELAPORAN.md
│   └── 11-MANAJEMEN-PROFIL-TOKO-DAN-ADMIN.md
│
└── integrasi-sistem/          <-- Dokumentasi otomatisasi & webhook backend
    ├── 01-BACKGROUND-JOB-AUTO-CANCEL.md
    └── 02-WEBHOOK-MIDTRANS.md
```

---

## 🌐 1. Dokumentasi Frontend Website Pelanggan (`documentations/pelanggan/`)

- 🔐 [**01. Autentikasi Pelanggan**](./pelanggan/01-AUTENTIKASI-PELANGGAN.md): Registrasi, Login, Token, Lupa Password.
- 📦 [**02. Katalog Produk & Aksesori**](./pelanggan/02-KATALOG-PRODUK-DAN-AKSESORI.md): List produk, filter kategori, detail varian.
- 🛒 [**03. Pembuatan Pesanan Sewa**](./pelanggan/03-PEMBUATAN-PESANAN-SEWA.md): Checkout sewa & cek stok bentrok tanggal.
- 🛍️ [**04. Pembuatan Pesanan Beli**](./pelanggan/04-PEMBUATAN-PESANAN-BELI.md): Purchase checkout barang permanen & aksesori.
- 🧵 [**05. Pembuatan Pesanan Custom**](./pelanggan/05-PEMBUATAN-PESANAN-CUSTOM.md): Order baju kustom seragam medis.
- 📜 [**06. Riwayat & Detail Pesanan**](./pelanggan/06-RIWAYAT-DAN-DETAIL-PESANAN.md): List pesanan & riwayat timeline status.
- 💳 [**07. Pembayaran Manual & Midtrans**](./pelanggan/07-PEMBAYARAN-MANUAL-DAN-MIDTRANS.md): Upload struk bukti transfer BCA.
- 💬 [**08. Live Chat Pelanggan**](./pelanggan/08-LIVE-CHAT-PELANGGAN.md): Kirim & baca percakapan dengan Admin.
- 🔔 [**09. Notifikasi Pelanggan**](./pelanggan/09-NOTIFIKASI-PELANGGAN.md): Notifikasi in-app realtime.
- ⭐ [**10. Ulasan & Testimonial**](./pelanggan/10-ULASAN-DAN-TESTIMONIAL.md): Rating 5 bintang & testimoni pesanan selesai.

---

## 📱 2. Dokumentasi Mobile App Admin Toko (`documentations/admin/`)

- 🔑 [**01. Autentikasi Admin**](./admin/01-AUTENTIKASI-ADMIN.md): Login Admin Staff/Owner.
- 🏷️ [**02. Manajemen Produk & Kategori**](./admin/02-MANAJEMEN-PRODUK-DAN-KATEGORI.md): Tambah/edit produk, varian & stok sewa.
- 🧤 [**03. Manajemen Aksesori**](./admin/03-MANAJEMEN-AKSESORI.md): Tambah/edit produk aksesori tambahan.
- ✅ [**04. Manajemen & Konfirmasi Pesanan**](./admin/04-MANAJEMEN-DAN-KONFIRMASI-PESANAN.md): Konfirmasi pesanan pending & tetapkan DP.
- 📊 [**05. Tracking Progress Pengerjaan**](./admin/05-TRACKING-PROGRESS-PENGERJAAN.md): Update % progress sterilisasi/produksi.
- 💸 [**06. Verifikasi Pembayaran**](./admin/06-VERIFIKASI-PEMBAYARAN.md): Terima / tolak bukti transfer pelanggan.
- 📅 [**07. Kalender & Operasional Sewa**](./admin/07-KALENDER-DAN-OPERASIONAL-SEWA.md): Jadwal kalender sewa & serah terima barang (Pickup).
- 🔄 [**08. Pengembalian & Denda Kerusakan**](./admin/08-PENGEMBALIAN-DAN-DENDA-KERUSAKAN.md): Pengecekan return barang, denda telat & rusak.
- 💬 [**09. Live Chat Admin**](./admin/09-LIVE-CHAT-ADMIN.md): Balas percakapan pelanggan via mobile app.
- 📈 [**10. Notifikasi & Pelaporan**](./admin/10-NOTIFIKASI-DAN-PELAPORAN.md): Laporan omset & pendapatan sewa.
- 🏪 [**11. Manajemen Profil Toko & Admin**](./admin/11-MANAJEMEN-PROFIL-TOKO-DAN-ADMIN.md): Jam operasional, alamat toko, & buat akun staff.

---

## ⚙️ 3. Integrasi Sistem Backend (`documentations/integrasi-sistem/`)

- ⏱️ [**01. Background Job Auto-Cancel**](./integrasi-sistem/01-BACKGROUND-JOB-AUTO-CANCEL.md): Cron job 5 menit pembatalan otomatis order expired.
- 🌐 [**02. Webhook Midtrans**](./integrasi-sistem/02-WEBHOOK-MIDTRANS.md): Callback notification payment gateway.

---

## 🚀 Interactive API Documentation
- **Scalar UI**: `http://localhost:5000/docs`
- **Swagger UI**: `http://localhost:5000/swagger`
