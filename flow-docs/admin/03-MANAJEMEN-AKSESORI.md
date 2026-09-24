# 03. Manajemen Aksesori (Mobile App Admin)

Dokumen ini menjelaskan alur pengelolaan data aksesori pendukung peralatan medis oleh Admin.

---

## 1. Menampilkan Daftar Aksesori

* **Endpoint**: `GET /api/v0/mobile/accessories`
* **Method**: `GET`
* **Auth**: `Authorization: Bearer <TOKEN_ADMIN>`

---

## 2. Tambah Aksesori Baru

* **Endpoint**: `POST /api/v0/mobile/accessories`
* **Method**: `POST`
* **Auth**: `Authorization: Bearer <TOKEN_ADMIN>`
* **Headers**: `Content-Type: multipart/form-data`

### Form Data Payload
- `name`: `Masker N95 Steril Box`
- `description`: `Box isi 20 pcs masker N95`
- `price`: `120000`
- `stock`: `30`
- `image`: *(File gambar)*

### Server Response (HTTP 201 Created)
```json
{
  "success": true,
  "message": "Aksesori berhasil ditambahkan",
  "data": {
    "id": "6",
    "name": "Masker N95 Steril Box",
    "price": "120000.00",
    "stock": 30
  }
}
```

---

## 3. Update & Hapus Aksesori

* **Update Aksesori**: `PUT /api/v0/mobile/accessories/:id`
* **Hapus Aksesori**: `DELETE /api/v0/mobile/accessories/:id`
