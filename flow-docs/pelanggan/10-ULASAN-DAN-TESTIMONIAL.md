# 10. Ulasan & Testimonial Pelanggan (Website Client)

Dokumen ini menjelaskan alur pembuatan rating & ulasan ulasan kepuasan produk/layanan oleh pelanggan setelah order selesai.

---

## 1. Mengirim Ulasan & Rating Baru

* **Endpoint**: `POST /api/v0/website/testimonials`
* **Method**: `POST`
* **Auth**: `Authorization: Bearer <TOKEN_PELANGGAN>`
* **Headers**: `Content-Type: application/json`

### A. Skenario Permisalan
> **Budi** memberi rating `5` bintang dan komentar pujian atas ketepatan waktu pengiriman dan kebersihan Jas APD.

### B. Request Body
```json
{
  "orderId": 88,
  "rating": 5,
  "comment": "Jas APD sangat bagus, terawat steril, dan respon admin Mbak Siti sangat cepat!"
}
```

### C. Server Response (HTTP 201 Created)
```json
{
  "success": true,
  "message": "Testimonial berhasil dikirim",
  "data": {
    "id": "12",
    "userId": "5",
    "orderId": "88",
    "rating": 5,
    "comment": "Jas APD sangat bagus, terawat steril, dan respon admin Mbak Siti sangat cepat!",
    "isFeatured": false,
    "createdAt": "2026-10-04T10:00:00.000Z"
  }
}
```

---

## 2. Menampilkan Ulasan Publik (Landing Page)

* **Endpoint**: `GET /api/v0/website/testimonials`
* **Method**: `GET`
* **Auth**: Public
