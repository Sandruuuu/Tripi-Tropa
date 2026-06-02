# TripiTropa Backend API

Platform penjualan tiket transportasi multi-moda (Pesawat, Bus, Kapal) — project UKL RPL.

## Dokumentasi

- **[PRD (Product Requirements Document)](./PRD-TripiTropa.md)** — spesifikasi lengkap fitur, alur bisnis, API, dan deploy
- **Swagger:** `/docs` (setelah server jalan)
- **Postman:** [`postman/TripiTropa.postman_collection.json`](./postman/TripiTropa.postman_collection.json)

## Tech Stack

- NestJS 11
- Prisma 7 + PostgreSQL (Supabase)
- JWT Authentication
- Mock Payment Gateway (siap diganti Midtrans)

## Setup

### 1. Environment

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="ganti-dengan-secret-kuat"
MOCK_PAYMENT_BASE_URL="http://localhost:3000"
PORT=3000
```

### 2. Install & Database

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 3. Jalankan Server

```bash
npm run start:dev
```

API: `http://localhost:3000` · Swagger: `http://localhost:3000/docs`

## Akun Seed (password: `password123`)

| Username | Role |
|----------|------|
| `admin` | ADMIN |
| `vendor_plane` | VENDOR (PLANE) |
| `vendor_bus` | VENDOR (BUS) |
| `vendor_ship` | VENDOR (SHIP) |

## Format Response

```json
{ "status": "success", "message": "...", "data": {} }
```

Login: `POST /auth` → header `Authorization: Bearer <token>`
