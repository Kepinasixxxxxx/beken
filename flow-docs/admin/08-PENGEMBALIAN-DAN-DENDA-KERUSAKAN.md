# 08. Pengembalian & Denda Kerusakan (Mobile App Admin)

Dokumen ini menjelaskan alur pengembalian barang sewa, pemeriksaan kondisi akhir, serta pencatatan denda keterlambatan atau kerusakan fisik.

---

## 1. Pengembalian Barang Sewa (Return)

* **Endpoint**: `PATCH /api/v0/mobile/rentals/:id/status`
* **Method**: `PATCH`
* **Auth**: `Authorization: Bearer <TOKEN_ADMIN_SITI>`
* **Headers**: `Content-Type: application/json`

---

### Skenario A: Pengembalian Tepat Waktu & Kondisi Baik

#### Request Body
```json
{
  "status": "dikembalikan",
  "itemConditionAfter": "Barang kembali lengkap tanpa kerusakan.",
  "damageNote": null,
  "penaltyAmount": 0
}
```

#### 🟢 Server Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Status sewa berhasil diperbarui",
  "data": {
    "id": "45",
    "status": "dikembalikan",
    "actualReturnDate": "2026-10-03T14:30:00.000Z",
    "penaltyAmount": "0.00"
  }
}
```

---

### Skenario B: Terlambat Mengembalikan / Terdapat Kerusakan (Denda)

#### Request Body
```json
{
  "status": "terlambat",
  "itemConditionAfter": "Pengembalian lewat 1 hari dari jadwal. Kancing bagian depan terlepas 1 pcs.",
  "damageNote": "Denda keterlambatan 1 hari (Rp 50.000) + Biaya perbaikan kancing (Rp 20.000)",
  "penaltyAmount": 70000
}
```

#### 🔴 Server Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Status sewa berhasil diperbarui",
  "data": {
    "id": "45",
    "status": "terlambat",
    "damageNote": "Denda keterlambatan 1 hari (Rp 50.000) + Biaya perbaikan kancing (Rp 20.000)",
    "penaltyAmount": "70000.00"
  }
}
```
