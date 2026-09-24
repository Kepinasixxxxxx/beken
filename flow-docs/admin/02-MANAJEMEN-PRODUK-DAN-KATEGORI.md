# 02. Manajemen Produk & Kategori (Mobile App Admin)

Dokumen ini menjelaskan alur inventaris bagi Admin untuk membuat, mengubah, menghapus, serta mengatur stok sewa & beli pada produk dan varian.

---

## 1. Menambah Produk & Varian Stok Baru

* **Endpoint**: `POST /api/v0/mobile/products`
* **Method**: `POST`
* **Auth**: `Authorization: Bearer <TOKEN_ADMIN>`
* **Headers**: `Content-Type: application/json`

### A. Request Body
```json
{
  "categoryId": 2,
  "name": "Stetoskop Digital Medis",
  "description": "Stetoskop digital presisi tinggi.",
  "basePriceBuy": 750000,
  "basePriceRent": 50000,
  "isCustomAvailable": false,
  "isVisible": true,
  "variants": [
    {
      "size": "All Size",
      "stockBuy": 10,
      "stockRent": 3,
      "priceBuyOverride": 750000,
      "priceRentOverride": 50000
    }
  ]
}
```

### B. Server Response (HTTP 201 Created)
```json
{
  "success": true,
  "message": "Produk berhasil ditambahkan",
  "data": {
    "id": "15",
    "name": "Stetoskop Digital Medis",
    "createdAt": "2026-09-25T01:30:00.000Z"
  }
}
```

---

## 2. Update Informasi Produk & Varian

* **Endpoint**: `PUT /api/v0/mobile/products/:id`
* **Method**: `PUT`

---

## 3. Hapus Produk (Soft Delete)

* **Endpoint**: `DELETE /api/v0/mobile/products/:id`
* **Method**: `DELETE`

---

## 4. Manajemen Kategori Produk

* **Daftar Kategori**: `GET /api/v0/mobile/categories`
* **Tambah Kategori**: `POST /api/v0/mobile/categories`
* **Update Kategori**: `PUT /api/v0/mobile/categories/:id`
* **Hapus Kategori**: `DELETE /api/v0/mobile/categories/:id`
