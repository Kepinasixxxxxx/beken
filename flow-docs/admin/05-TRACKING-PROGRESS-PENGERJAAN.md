# 05. Tracking Progress Pengerjaan (Mobile App Admin)

Dokumen ini menjelaskan alur pengkinian persentase perkembangan pengerjaan (*progress bar*) pesanan oleh Admin.

---

## 1. Update Progress Pengerjaan Pesanan

* **Endpoint**: `PATCH /api/v0/mobile/orders/:id/progress`
* **Method**: `PATCH`
* **Auth**: `Authorization: Bearer <TOKEN_ADMIN_SITI>`
* **Headers**: `Content-Type: application/json`

### A. Skenario Permisalan
> Admin **Siti** mengupdate progress pesanan sewa Jas APD menjadi 50% untuk perselisihan pencucian steril.

### B. Request Body
```json
{
  "progressPercentage": 50,
  "statusLabel": "Sterilisasi UV & Pencucian APD",
  "note": "Jas APD dalam proses sterilisasi di ruang UV."
}
```

### C. Server Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Progress berhasil diperbarui",
  "data": {
    "id": "301",
    "orderId": "88",
    "progressPercentage": 50,
    "statusLabel": "Sterilisasi UV & Pencucian APD",
    "note": "Jas APD dalam proses sterilisasi di ruang UV.",
    "updatedBy": "1",
    "createdAt": "2026-09-25T03:00:00.000Z"
  }
}
```

### D. Logika Perubahan Status Otomatis
- Jika `progressPercentage >= 100` dan `isLunas = true` -> Status order otomatis diubah ke `siap_diambil`.
- Jika `progressPercentage > 0` dan status belum `diproses` -> Status order otomatis diubah ke `diproses`.
