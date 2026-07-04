# Secure Profile API

> REST API dengan autentikasi JWT untuk UNSIA Digital Library  
> Praktikum Pemrograman Web 2 — Pertemuan 10  
> Program Studi Informatika, PJJ Informartika UNIVERSITAS SIBER ASIA

---

## Deskripsi

Secure Profile API adalah REST API berbasis Node.js dan Express yang mengimplementasikan mekanisme autentikasi stateless menggunakan JSON Web Token (JWT). API ini dibangun sebagai studi kasus sistem autentikasi untuk UNSIA Digital Library dengan menerapkan pengamanan dasar pada input, password, endpoint, dan konfigurasi aplikasi.

---

## Teknologi yang Digunakan

| Package | Versi | Kegunaan |
|---|---|---|
| express | Latest | Framework web Node.js |
| bcryptjs | Latest | Hashing password |
| jsonwebtoken | Latest | Membuat dan memverifikasi JWT |
| express-validator | Latest | Validasi input dari client |
| express-rate-limit | Latest | Membatasi percobaan autentikasi |
| cors | Latest | Kontrol akses lintas origin |
| helmet | Latest | Keamanan header HTTP |
| dotenv | Latest | Manajemen environment variables |
| nodemon | Latest (dev) | Auto-restart server saat development |

---

## Persyaratan Sistem

- Node.js LTS (versi yang masih didukung)
- npm (sudah termasuk dalam instalasi Node.js)
- Postman atau Thunder Client untuk pengujian API

---

## Instalasi

### 1. Clone atau ekstrak repository

```bash
git clone <url-repository>
cd secure-profile-api
```

Atau ekstrak file ZIP lalu buka foldernya.

### 2. Install semua dependensi

```bash
npm install
```

### 3. Buat file `.env`

Buat file `.env` di root folder proyek dengan isi berikut:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=ganti_dengan_kunci_rahasia_panjang_dan_unik
JWT_EXPIRES_IN=1h
CLIENT_ORIGIN=http://localhost:5173
```

> ⚠️ **Penting:** Jangan gunakan nilai `JWT_SECRET` di atas untuk produksi. Gunakan nilai yang panjang, unik, dan acak.

---

## Menjalankan Server

### Mode Development (dengan auto-restart)

```bash
npm run dev
```

### Mode Production

```bash
npm start
```

Output yang diharapkan:

```
[nodemon] starting `node server.js`
Server berjalan pada http://localhost:3000
```

> **Catatan:** API ini menggunakan in-memory data store. Data pengguna akan hilang setiap kali server di-restart. Untuk produksi, gunakan database seperti MongoDB atau MySQL.

---

## Struktur Folder

```
secure-profile-api/
├── src/
│   ├── controllers/
│   │   ├── authController.js     # Logic register dan login
│   │   └── userController.js     # Logic getMe, getAllUsers, getUserCount
│   ├── data/
│   │   └── users.js              # In-memory data store
│   ├── middleware/
│   │   ├── auth.js               # Auth guard (middleware protect)
│   │   ├── errorHandler.js       # Global error handler
│   │   ├── notFound.js           # Handler endpoint tidak ditemukan
│   │   └── rateLimiter.js        # Rate limiting autentikasi
│   ├── routes/
│   │   ├── authRoutes.js         # Route register dan login
│   │   └── userRoutes.js         # Route endpoint terproteksi
│   ├── utils/
│   │   └── generateToken.js      # Utility pembuat JWT
│   ├── validators/
│   │   └── authValidator.js      # Validator input register dan login
│   └── app.js                    # Konfigurasi Express
├── .env                          # Environment variables (tidak di-push)
├── .gitignore                    # Daftar file yang diabaikan Git
├── package.json                  # Metadata dan dependensi proyek
└── server.js                     # Entry point server
```

---

## Daftar Endpoint

### Public Endpoints (Tanpa Token)

| Method | Endpoint | Deskripsi | Status |
|---|---|---|---|
| GET | `/api/health` | Cek status server | 200 |
| POST | `/api/auth/register` | Registrasi pengguna baru | 201, 409, 422 |
| POST | `/api/auth/login` | Login dan mendapatkan token | 200, 401, 422 |

### Protected Endpoints (Butuh Bearer Token)

| Method | Endpoint | Deskripsi | Status |
|---|---|---|---|
| GET | `/api/users/me` | Ambil profil pengguna dari token | 200, 401 |
| GET | `/api/users` | Ambil semua pengguna tanpa passwordHash | 200, 401 |
| GET | `/api/users/count` | Ambil jumlah pengguna terdaftar | 200, 401 |

---

## Contoh Penggunaan

### Register

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Budi Santoso",
  "email": "budi@unas.ac.id",
  "password": "Password123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registrasi berhasil.",
  "data": {
    "id": "<uuid>",
    "name": "Budi Santoso",
    "email": "budi@unas.ac.id"
  },
  "token": "<jwt-token>"
}
```

### Login

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "budi@unas.ac.id",
  "password": "Password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "id": "<uuid>",
    "name": "Budi Santoso",
    "email": "budi@unas.ac.id"
  },
  "token": "<jwt-token>"
}
```

### Akses Protected Endpoint

**Request:**
```http
GET /api/users/me
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "<uuid>",
    "name": "Budi Santoso",
    "email": "budi@unas.ac.id",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

## Aturan Validasi Input

### Register
| Field | Aturan |
|---|---|
| `name` | Wajib diisi, 3-50 karakter |
| `email` | Format email valid |
| `password` | Minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka |

### Login
| Field | Aturan |
|---|---|
| `email` | Format email valid |
| `password` | Wajib diisi |

---

## Fitur Keamanan

- **Password Hashing** — Password di-hash menggunakan bcryptjs dengan salt rounds 10
- **JWT Authentication** — Token ditandatangani dengan algoritma HS256 dan memiliki masa berlaku
- **Rate Limiting** — Endpoint autentikasi dibatasi 10 request per 15 menit per IP
- **Helmet** — Menambahkan header keamanan HTTP otomatis
- **CORS** — Akses dibatasi sesuai `CLIENT_ORIGIN` di `.env`
- **Input Validation** — Semua input divalidasi sebelum diproses controller
- **Generic Error Messages** — Pesan error login dibuat generik untuk mencegah account enumeration attack
- **Payload Minimum** — JWT hanya memuat `sub` (user ID), tidak ada data sensitif

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| `Cannot find module` | Jalankan `npm install` di root folder proyek |
| `JWT_SECRET belum didefinisikan` | Pastikan file `.env` ada di root folder dan sudah diisi |
| `401 Unauthorized` tanpa token | Gunakan tab Authorization > Bearer Token di Postman |
| `401 token tidak valid` | Login ulang untuk mendapatkan token baru |
| Data hilang setelah restart | Normal — gunakan database untuk produksi |
| CORS error di frontend | Sesuaikan `CLIENT_ORIGIN` di `.env` dengan alamat frontend |

---
