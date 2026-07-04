# Secure Profile API

> REST API dengan autentikasi JWT untuk UNSIA Digital Library  
> Praktikum Pemrograman Web 2 — Pertemuan 10  
> Program Studi Informatika, Universitas Siber Asia

---

## Deskripsi

Secure Profile API adalah REST API berbasis Node.js dan Express yang mengimplementasikan mekanisme autentikasi stateless menggunakan JSON Web Token (JWT). API ini dibangun sebagai studi kasus sistem autentikasi untuk UNSIA Digital Library dengan menerapkan pengamanan dasar pada input, password, endpoint, konfigurasi aplikasi, sistem role, manajemen password, persistensi data menggunakan MongoDB, dan automated testing menggunakan Jest dan Supertest.

---

## Teknologi yang Digunakan

| Package | Kegunaan |
|---|---|
| express | Framework web Node.js |
| bcryptjs | Hashing password |
| jsonwebtoken | Membuat dan memverifikasi JWT |
| express-validator | Validasi input dari client |
| express-rate-limit | Membatasi percobaan autentikasi |
| cors | Kontrol akses lintas origin |
| helmet | Keamanan header HTTP |
| dotenv | Manajemen environment variables |
| mongoose | ODM untuk MongoDB |
| nodemon *(dev)* | Auto-restart server saat development |
| jest *(dev)* | Framework automated testing |
| supertest *(dev)* | HTTP assertion library untuk testing API |

---

## Persyaratan Sistem

- Node.js LTS (versi yang masih didukung)
- npm (sudah termasuk dalam instalasi Node.js)
- MongoDB v6.0 ke atas (berjalan sebagai Windows Service)
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
MONGO_URI=mongodb://127.0.0.1:27017/secure-profile-api
MONGO_URI_TEST=mongodb://127.0.0.1:27017/secure-profile-api-test
```

> ⚠️ **Penting:** Jangan gunakan nilai `JWT_SECRET` di atas untuk produksi. Gunakan nilai yang panjang, unik, dan acak.

### 4. Pastikan MongoDB Service Berjalan

```powershell
Get-Service -Name MongoDB
```

Kalau statusnya `Stopped`, jalankan:

```powershell
Start-Service -Name MongoDB
```

### 5. Seed Akun Admin

```bash
npm run seed
```

Output yang diharapkan:
```
MongoDB terhubung...
Akun admin berhasil dibuat!
```

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
MongoDB terhubung: 127.0.0.1
Server berjalan pada http://localhost:3000
```

---

## Menjalankan Automated Test

```bash
npm test
```

Output yang diharapkan:

```
PASS __tests__/auth.test.js
PASS __tests__/user.test.js

Test Suites: 2 passed, 2 total
Tests:       14 passed, 14 total
```

> **Catatan:** Test menggunakan database terpisah (`secure-profile-api-test`) yang otomatis di-drop setelah test selesai. Data production tidak akan terganggu.

---

## Akun Default (Development)

Saat menjalankan `npm run seed`, akun admin berikut akan dibuat otomatis:

| Field | Value |
|---|---|
| Email | `admin@unas.ac.id` |
| Password | `Admin123` |
| Role | `admin` |

> ⚠️ Ganti kredensial ini sebelum deploy ke produksi!

---

## Struktur Folder

```
secure-profile-api/
├── __tests__/
│   ├── auth.test.js              # Test register dan login
│   └── user.test.js              # Test protected endpoints
├── src/
│   ├── config/
│   │   ├── db.js                 # Koneksi MongoDB production
│   │   ├── testDb.js             # Koneksi MongoDB untuk testing
│   │   └── seedAdmin.js          # Script seed akun admin
│   ├── controllers/
│   │   ├── authController.js     # Logic register, login, changePassword
│   │   └── userController.js     # Logic getMe, getAllUsers, getUserCount, adminGetAllDetails
│   ├── data/
│   │   └── users.js              # Mongoose Schema dan Model
│   ├── middleware/
│   │   ├── auth.js               # Auth guard (middleware protect)
│   │   ├── adminOnly.js          # Middleware khusus role admin
│   │   ├── errorHandler.js       # Global error handler
│   │   ├── notFound.js           # Handler endpoint tidak ditemukan
│   │   └── rateLimiter.js        # Rate limiting autentikasi
│   ├── routes/
│   │   ├── authRoutes.js         # Route register, login, change-password
│   │   └── userRoutes.js         # Route endpoint terproteksi
│   ├── utils/
│   │   └── generateToken.js      # Utility pembuat JWT
│   ├── validators/
│   │   └── authValidator.js      # Validator register, login, changePassword
│   └── app.js                    # Konfigurasi Express
├── .env                          # Environment variables (tidak di-push)
├── .gitignore                    # Daftar file yang diabaikan Git
├── jest.setup.js                 # Setup environment untuk Jest
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

| Method | Endpoint | Role | Deskripsi | Status |
|---|---|---|---|---|
| POST | `/api/auth/change-password` | user/admin | Ganti password dengan validasi password lama | 200, 401, 422 |
| GET | `/api/users/me` | user/admin | Ambil profil pengguna dari token | 200, 401 |
| GET | `/api/users` | user/admin | Ambil semua pengguna tanpa passwordHash | 200, 401 |
| GET | `/api/users/count` | user/admin | Ambil jumlah pengguna terdaftar | 200, 401 |
| GET | `/api/users/admin/details` | **admin only** | Ambil detail semua pengguna termasuk role | 200, 401, 403 |

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
    "id": "<mongodb-objectid>",
    "name": "Budi Santoso",
    "email": "budi@unas.ac.id",
    "role": "user",
    "createdAt": "2026-07-05T00:00:00.000Z"
  },
  "token": "<jwt-token>"
}
```

---

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
    "id": "<mongodb-objectid>",
    "name": "Budi Santoso",
    "email": "budi@unas.ac.id",
    "role": "user",
    "createdAt": "2026-07-05T00:00:00.000Z"
  },
  "token": "<jwt-token>"
}
```

---

### Ganti Password

**Request:**
```http
POST /api/auth/change-password
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "oldPassword": "Password123",
  "newPassword": "NewPassword456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password berhasil diubah. Silakan login kembali dengan password baru."
}
```

---

### Akses Profil Sendiri

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
    "id": "<mongodb-objectid>",
    "name": "Budi Santoso",
    "email": "budi@unas.ac.id",
    "role": "user",
    "createdAt": "2026-07-05T00:00:00.000Z"
  }
}
```

---

### Endpoint Admin

**Request:**
```http
GET /api/users/admin/details
Authorization: Bearer <token-admin>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "<mongodb-objectid>",
      "name": "Admin UNSIA",
      "email": "admin@unas.ac.id",
      "role": "admin",
      "createdAt": "2026-07-05T00:00:00.000Z"
    }
  ]
}
```

**Response jika bukan admin (403 Forbidden):**
```json
{
  "success": false,
  "message": "Akses ditolak. Endpoint ini hanya untuk admin."
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
| `role` | **Tidak boleh dikirim** — selalu di-set server sebagai `user` |

### Login
| Field | Aturan |
|---|---|
| `email` | Format email valid |
| `password` | Wajib diisi |

### Ganti Password
| Field | Aturan |
|---|---|
| `oldPassword` | Wajib diisi |
| `newPassword` | Minimal 8 karakter, huruf besar, huruf kecil, angka, tidak boleh sama dengan password lama |

---

## Fitur Keamanan

- **Password Hashing** — Password di-hash menggunakan bcryptjs dengan salt rounds 10, tidak pernah disimpan dalam bentuk plain text
- **JWT Authentication** — Token ditandatangani dengan algoritma HS256 dan memiliki masa berlaku
- **Role-Based Access Control** — Endpoint admin hanya bisa diakses pengguna dengan role `admin`
- **Role Protection** — Field `role` tidak dapat diatur melalui request register (mencegah privilege escalation)
- **Rate Limiting** — Endpoint autentikasi dibatasi 10 request per 15 menit per IP
- **Helmet** — Menambahkan header keamanan HTTP otomatis
- **CORS** — Akses dibatasi sesuai `CLIENT_ORIGIN` di `.env`
- **Input Validation** — Semua input divalidasi sebelum diproses controller
- **Generic Error Messages** — Pesan error login dibuat generik untuk mencegah account enumeration attack
- **Payload Minimum** — JWT hanya memuat `sub` (user ID), tidak ada data sensitif di payload
- **MongoDB Persistence** — Data tersimpan permanen di database, tidak hilang saat server restart
- **Isolated Test Database** — Testing menggunakan database terpisah agar data production aman

---

## Cakupan Automated Test (14 Test Cases)

### `__tests__/auth.test.js`
| Test | Ekspektasi |
|---|---|
| Register dengan data valid | 201 Created + token |
| Register password lemah | 422 Unprocessable Entity |
| Register email duplikat | 409 Conflict |
| Register dengan field role | 422 Unprocessable Entity |
| Login dengan kredensial valid | 200 OK + token |
| Login dengan password salah | 401 + pesan generik |
| Login dengan email tidak terdaftar | 401 Unauthorized |

### `__tests__/user.test.js`
| Test | Ekspektasi |
|---|---|
| GET `/api/users/me` dengan token valid | 200 OK + createdAt |
| GET `/api/users/me` tanpa token | 401 Unauthorized |
| GET `/api/users/me` token dimodifikasi | 401 Unauthorized |
| GET `/api/users` tanpa passwordHash | 200 OK + data aman |
| GET `/api/users/count` | 200 OK + count > 0 |
| POST `/api/auth/change-password` berhasil | 200 OK |
| POST `/api/auth/change-password` password salah | 401 Unauthorized |

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| `Cannot find module` | Jalankan `npm install` di root folder proyek |
| `JWT_SECRET belum didefinisikan` | Pastikan file `.env` ada di root folder dan sudah diisi |
| `MONGO_URI belum didefinisikan` | Pastikan `MONGO_URI` ada di file `.env` |
| MongoDB tidak bisa konek | Jalankan `Start-Service -Name MongoDB` di PowerShell Administrator |
| `401 Unauthorized` tanpa token | Gunakan tab Authorization > Bearer Token di Postman |
| `401 token tidak valid` | Login ulang untuk mendapatkan token baru |
| `403 Forbidden` di endpoint admin | Pastikan login menggunakan akun admin, bukan user biasa |
| Test gagal semua | Pastikan `jest.setup.js` ada dan MongoDB service berjalan |
| CORS error di frontend | Sesuaikan `CLIENT_ORIGIN` di `.env` dengan alamat frontend |

---

> Modul Praktikum Pemrograman Web 2 — Pertemuan 10
> Program Studi Informatika, FTKI Universitas Nasional
> Revisi: Juni 2026
