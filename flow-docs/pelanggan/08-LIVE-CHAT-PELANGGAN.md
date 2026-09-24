# 08. Live Chat Pelanggan (Website Client)

Dokumen ini menjelaskan alur konsultasi dan chat langsung dari pelanggan ke Admin toko.

---

## 1. Mengirim Pesan Chat Baru

* **Endpoint**: `POST /api/v0/website/chat/messages`
* **Method**: `POST`
* **Auth**: `Authorization: Bearer <TOKEN_PELANGGAN>`
* **Headers**: `Content-Type: application/json`

### Request Body
```json
{
  "messageText": "Halo Admin, apakah Jas APD ukuran L ini anti air dan cocok untuk ruangan ICU?"
}
```

### Server Response (HTTP 201 Created)
```json
{
  "success": true,
  "message": "Pesan berhasil dikirim",
  "data": {
    "id": "501",
    "conversationId": "10",
    "senderType": "user",
    "senderId": "5",
    "messageText": "Halo Admin, apakah Jas APD ukuran L ini anti air dan cocok untuk ruangan ICU?",
    "isRead": false,
    "createdAt": "2026-09-25T01:10:00.000Z"
  }
}
```

---

## 2. Mengambil Seluruh Pesan Percakapan

* **Endpoint**: `GET /api/v0/website/chat/messages`
* **Method**: `GET`
* **Auth**: `Authorization: Bearer <TOKEN_PELANGGAN>`
