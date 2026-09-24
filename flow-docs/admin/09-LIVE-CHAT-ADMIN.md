# 09. Live Chat Admin (Mobile App Admin)

Dokumen ini menjelaskan alur balasan chat dari Admin ke Pelanggan pada aplikasi Mobile Admin.

---

## 1. Menampilkan Daftar Percakapan Chat

* **Endpoint**: `GET /api/v0/mobile/chat/conversations`
* **Method**: `GET`
* **Auth**: `Authorization: Bearer <TOKEN_ADMIN_SITI>`

---

## 2. Membaca Pesan Percakapan Pelanggan

* **Endpoint**: `GET /api/v0/mobile/chat/conversations/:id`
* **Method**: `GET`

---

## 3. Membalas Pesan Chat Pelanggan

* **Endpoint**: `POST /api/v0/mobile/chat/conversations/:id/messages`
* **Method**: `POST`
* **Auth**: `Authorization: Bearer <TOKEN_ADMIN_SITI>`
* **Headers**: `Content-Type: application/json`

### Request Body
```json
{
  "messageText": "Halo Kak Budi, betul 100% waterproof dengan standar medis."
}
```

### Server Response (HTTP 201 Created)
```json
{
  "success": true,
  "message": "Pesan berhasil dikirim",
  "data": {
    "id": "502",
    "conversationId": "10",
    "senderType": "admin",
    "senderId": "1",
    "messageText": "Halo Kak Budi, betul 100% waterproof dengan standar medis.",
    "createdAt": "2026-09-25T01:12:00.000Z"
  }
}
```
