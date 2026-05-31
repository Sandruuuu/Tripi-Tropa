# TripiTropa Backend API

Platform penjualan tiket transportasi multi-moda (Pesawat, Bus, Kapal) — project UKL RPL.

## Tech Stack

- NestJS 11
- Prisma 7 + PostgreSQL (Supabase)
- JWT Authentication
- Mock Payment Gateway (siap diganti Midtrans)

## Setup

### 1. Environment

Salin `.env.example` ke `.env` dan isi koneksi Supabase:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
JWT_SECRET="ganti-dengan-secret-kuat"
MOCK_PAYMENT_BASE_URL="http://localhost:3000"
PORT=3000
```

### 2. Install & Database

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 3. Jalankan Server

```bash
npm run start:dev
```

API berjalan di `http://localhost:3000`

## Format Response API

Semua endpoint mengembalikan:

```json
{
  "status": "success",
  "message": "Pesan operasi",
  "data": {}
}
```

Jika gagal:

```json
{
  "status": "failed",
  "message": "Pesan error",
  "data": []
}
```

## Role & Autentikasi

| Role | Login username contoh | Hak akses |
|------|----------------------|-----------|
| ADMIN | `admin` | Kelola semua data + vendor employee |
| VENDOR | `vendor_plane` / `vendor_bus` / `vendor_ship` | CRUD armada/jadwal moda sendiri |
| CUSTOMER | register via `POST /customers` | Booking tiket + riwayat transaksi |

Login: `POST /auth` dengan body `{ "username", "password" }` → dapat JWT token.

Header protected endpoint: `Authorization: Bearer <token>`

## Akun Seed (password: `password123`)

- Admin: `admin`
- Vendor pesawat: `vendor_plane`
- Vendor bus: `vendor_bus`
- Vendor kapal: `vendor_ship`

## Endpoint Utama

| Method | Path | Akses |
|--------|------|-------|
| POST | `/auth` | Public |
| POST | `/customers` | Public (register) |
| GET | `/customers/schedules` | Public (katalog) |
| GET | `/customers/me` | Customer |
| POST | `/customers/transactions` | Customer (booking) |
| GET | `/customers/transactions/me` | Customer |
| GET/POST/PATCH/DELETE | `/admins/*` | Admin |
| GET/POST/PATCH/DELETE | `/vendors/*` | Vendor |
| GET | `/payments/mock/:id` | Public |
| POST | `/payments/mock/:id/pay` | Public (simulasi bayar) |
| POST | `/payments/webhook` | Public (callback gateway) |

Setiap resource memiliki: **GET all**, **GET by id**, **GET filter**, **POST**, **PATCH**, **DELETE**.

## Alur Booking & Mock Payment

1. Customer login → dapat token
2. Lihat katalog: `GET /customers/schedules?type=PLANE&origin=Surabaya`
3. Booking: `POST /customers/transactions` dengan `{ "schedule_id", "seat_ids": [1,2] }`
4. Response berisi `payment_url`
5. Simulasi bayar: `POST /payments/mock/:transactionId/pay`
6. Status transaksi berubah `SUCCESS`, kursi terkunci

## Postman

Import file: [`postman/TripiTropa.postman_collection.json`](postman/TripiTropa.postman_collection.json)

Variable collection:
- `BASE-URL`: `http://localhost:3000`
- `token`: isi setelah login

## Upgrade ke Midtrans (nanti)

1. Daftar akun sandbox Midtrans
2. Tambahkan env `MIDTRANS_SERVER_KEY` dan `MIDTRANS_CLIENT_KEY`
3. Ganti logic di `PaymentService.createPayment()` dengan `midtrans-client` Snap
4. Webhook `/payments/webhook` parse signature Midtrans

Package `midtrans-client` sudah terinstall di dependencies.
