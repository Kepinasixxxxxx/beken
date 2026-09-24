# 02. Katalog Produk & Aksesori (Website Client)

Dokumen ini menjelaskan alur penelusuran produk, varian ukuran, opsi sewa/beli, dan daftar aksesori pada website pelanggan.

---

## 1. Menampilkan Daftar Produk

* **Endpoint**: `GET /api/v0/website/products`
* **Method**: `GET`
* **Auth**: Public
* **Query Parameters**:
  - `search` (opsional): Pencarian nama produk (misal: `Jas`)
  - `categoryId` (opsional): Filter ID kategori (misal: `2`)

### Server Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Daftar produk berhasil diambil",
  "data": [
    {
      "id": "12",
      "name": "Jas APD Medis Proteksi Tinggi",
      "description": "Jas pelindung medis bahan waterproof premium dengan standar ketahanan tinggi.",
      "basePriceBuy": "350000.00",
      "basePriceRent": "150000.00",
      "isCustomAvailable": false,
      "isVisible": true,
      "category": {
        "id": "2",
        "name": "Pakaian Medis"
      },
      "variants": [
        {
          "id": "34",
          "size": "L",
          "stockBuy": 10,
          "stockRent": 2,
          "priceRentOverride": "150000.00"
        }
      ],
      "images": [
        {
          "id": "101",
          "imageUrl": "/uploads/products/jas-apd-primary.jpg",
          "isPrimary": true
        }
      ]
    }
  ]
}
```

---

## 2. Detail Produk Spesifik

* **Endpoint**: `GET /api/v0/website/products/:id`
* **Method**: `GET`

### Server Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Detail produk berhasil diambil",
  "data": {
    "id": "12",
    "name": "Jas APD Medis Proteksi Tinggi",
    "basePriceRent": "150000.00",
    "variants": [
      {
        "id": "34",
        "size": "L",
        "stockRent": 2
      }
    ]
  }
}
```

---

## 3. Menampilkan Daftar Kategori Produk

* **Endpoint**: `GET /api/v0/website/categories`
* **Method**: `GET`

---

## 4. Menampilkan Daftar Aksesori Pendukung

* **Endpoint**: `GET /api/v0/website/accessories`
* **Method**: `GET`

### Server Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Daftar aksesori berhasil diambil",
  "data": [
    {
      "id": "5",
      "name": "Sarung Tangan Latex Box",
      "description": "Isi 100 pcs sarung tangan steril",
      "price": "85000.00",
      "stock": 50,
      "imageUrl": "/uploads/accessories/latex-glove.jpg"
    }
  ]
}
```
