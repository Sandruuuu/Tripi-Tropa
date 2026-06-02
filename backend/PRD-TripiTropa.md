# PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Proyek:** TripiTropa — Platform Penjualan Tiket Transportasi Multi-Moda (Pesawat, Bus, Kapal)

**Target Pengguna Dokumen:** Tim Pengembang UKL RPL (1 Backend Engineer, 1 Frontend Engineer)

**Versi:** 1.0

---

## 1. Executive Summary & Branding

### Ringkasan Proyek

Proyek ini bertujuan membangun platform digital **penjualan dan pemesanan tiket perjalanan** yang mendukung tiga moda transportasi: **Pesawat (PLANE)**, **Bus (BUS)**, dan **Kapal (SHIP)**. Platform menghubungkan **Admin pusat** (kelola seluruh ekosistem), **Vendor per moda** (mengelola armada, jadwal, gerbong/kabin, dan kursi), serta **Customer** (mencari jadwal, memilih kursi, dan menyelesaikan pembayaran tiket).

Backend dibangun dengan **NestJS 11 + Prisma 7 + PostgreSQL (Supabase)**. Pembayaran awal menggunakan **Mock Payment Gateway** internal (siap diganti **Midtrans**). API terdokumentasi di **Swagger `/docs`** dan dikoleksi **Postman**.

### Visi Produk

Menjadi solusi *all-in-one* bagi penumpang untuk **menemukan jadwal**, **memilih kursi**, dan **membayar tiket** dalam satu alur terintegrasi, sekaligus membantu operator transportasi (maskapai, PO bus, operator kapal) **mendigitalisasi inventori kursi dan jadwal** dalam satu platform terpusat.

### Rekomendasi Nama Aplikasi & Filosofi

1. **TripiTropa**
   *Filosofi:* Gabungan *Trip* (perjalanan) dan nuansa tropis Indonesia. Nama utama proyek UKL; mencerminkan perjalanan lintas moda di wilayah tropis.

2. **TropaTransit**
   *Filosofi:* Menekankan layanan **transit** multi-moda (pesawat–bus–kapal) dalam satu ekosistem digital.

3. **SeatGo Nusantara**
   *Filosofi:* Fokus pada pemilihan **kursi** (*seat*) dan mobilitas antarpulau/Nusantara.

---

## 2. Stakeholder & Functional Requirements

Berikut pemetaan kebutuhan fungsional berdasarkan peran pengguna (*user roles*):

| Role Pengguna | Deskripsi Fitur / Kebutuhan Fungsional |
| --- | --- |
| **Admin (Super Admin)** | * Kelola akun admin, customer, dan vendor employee.<br><br>* CRUD master data: transportation, schedule, carriage, seat (lintas semua moda).<br><br>* Pantau dan update status transaksi global.<br><br>* Buat akun vendor per moda (PLANE / BUS / SHIP) — **tidak ada registrasi vendor publik**. |
| **Vendor Employee** | * Login terikat satu `transportType` (pesawat, bus, atau kapal).<br><br>* CRUD armada (`transportation`), jadwal (`schedule`), gerbong/kabin (`carriage`), kursi (`seat`) **hanya untuk moda dan data milik vendor sendiri**.<br><br>* Lihat profil vendor: `GET /vendors/me`. |
| **Customer (Penumpang)** | * Registrasi publik via `POST /customers`.<br><br>* Login `POST /auth` → JWT Bearer token.<br><br>* Jelajahi katalog jadwal aktif (filter moda, asal, tujuan, paginasi).<br><br>* Booking tiket: pilih jadwal + beberapa kursi → dapat `payment_url`.<br><br>* Riwayat transaksi pribadi.<br><br>* Pembayaran via mock checkout / webhook (nanti Midtrans). |

---

## 3. Arsitektur Dokumen Bisnis (Business Flow)

### 3.1. Alur Registrasi & Login Customer

```
[Customer] -> POST /customers (username, password, NIK, alamat, nama, telepon)
                   |
                   v
        [Sistem] Validasi DTO + hash password (bcrypt)
                   |
                   v
        [Database] Simpan Customer (role: CUSTOMER)
                   |
                   v
[Customer] -> POST /auth { username, password }
                   |
                   v
        [Sistem] Cek urutan: Admin -> Customer -> VendorEmployee
                   |
                   v
        [Response] JWT { sub, username, role, transportType? }
                   |
                   v
[Client] Simpan token -> Header: Authorization: Bearer <token>
```

### 3.2. Alur Pembuatan Akun Vendor (oleh Admin)

```
[Admin] Login POST /auth (username: admin)
                   |
                   v
[Admin] POST /admins/vendor-employees
        (username, password, name, phone, transportType)
                   |
                   v
        [Database] VendorEmployee + createdByAdminId
                   |
                   v
[Vendor] Login POST /auth (contoh: vendor_plane)
                   |
                   v
[Vendor] CRUD /vendors/transportations -> schedules -> carriages -> seats
```

**Catatan:** Tidak ada alur approval PENDING — vendor langsung aktif setelah dibuat admin.

### 3.3. Alur Booking & Mock Payment

1. **Katalog:** Customer (atau publik) memanggil `GET /customers/schedules?type=PLANE&origin=Surabaya`.
2. **Pilih kursi:** Dari response katalog/detail, ambil `seat_ids` yang `isAvailable: true`.
3. **Booking:** Customer login → `POST /customers/transactions` dengan `{ schedule_id, seat_ids }`.
4. **Validasi backend:** Jadwal status `ACTIVE`; semua kursi tersedia dan milik jadwal tersebut.
5. **Transaksi DB:** Buat `Transaction` (PENDING), `BookingSeat`, set kursi `isAvailable = false`; generate `externalOrderId` format `TRP-{timestamp}-{customerId}`.
6. **Payment URL:** Backend set `payment_url` → `{MOCK_PAYMENT_BASE_URL}/payments/mock/{transactionId}`.
7. **Simulasi bayar:** `POST /payments/mock/:transactionId/pay` atau webhook `POST /payments/webhook`.
8. **Sukses:** Status `SUCCESS`; kursi tetap tidak tersedia. Jika **FAILED**, kursi dikembalikan `isAvailable = true`.

```
[Customer] Pilih jadwal + kursi
                   |
                   v
        POST /customers/transactions
                   |
                   v
        [DB $transaction] Transaction PENDING + lock seats
                   |
                   v
        [Response] payment_url
                   |
        +----------+----------+
        |                     |
   POST mock/pay          Webhook failed
        |                     |
        v                     v
   status SUCCESS        status FAILED -> release seats
```

### 3.4. Alur Vendor Menyiapkan Inventori Tiket

1. Admin membuat vendor employee per moda (atau gunakan seed).
2. Vendor login → `GET /vendors/me`.
3. Vendor membuat **Transportation** (armada: nama, kode unik, kapasitas).
4. Vendor membuat **Schedule** (origin, destination, departureTime, price, status).
5. Vendor membuat **Carriage** (nomor gerbong/kabin, classType: ECONOMY/BUSINESS/FIRST/VIP).
6. Vendor membuat **Seat** (nomor kursi per gerbong).
7. Customer melihat jadwal aktif di katalog publik dan dapat memesan kursi yang masih available.

### 3.5. Alur Validasi Booking Kursi (Pseudocode)

Mekanisme penguncian kursi dilakukan dalam **satu transaksi Prisma** agar tidak terjadi *double booking* saat dua request bersamaan.

```typescript
FUNCTION create_booking(customer_id, schedule_id, seat_ids[]):
    schedule = FIND Schedule WHERE id = schedule_id AND status = ACTIVE
    IF schedule NOT FOUND THEN
        THROW NotFoundException("Jadwal tidak ditemukan atau tidak aktif")
    ENDIF

    seats = FIND Seats WHERE id IN seat_ids
        AND isAvailable = true
        AND carriage.scheduleId = schedule_id

    IF seats.length != seat_ids.length THEN
        THROW BadRequestException("Salah satu kursi tidak tersedia")
    ENDIF

    total_amount = schedule.price * seat_ids.length
    external_order_id = "TRP-" + timestamp + "-" + customer_id

    BEGIN DATABASE TRANSACTION:
        transaction = CREATE Transaction {
            customerId: customer_id,
            scheduleId: schedule_id,
            status: PENDING,
            externalOrderId: external_order_id,
            totalAmount: total_amount,
            bookingSeats: seat_ids mapped to BookingSeat
        }
        UPDATE Seats SET isAvailable = false WHERE id IN seat_ids
    COMMIT

    payment_url = MOCK_PAYMENT_BASE_URL + "/payments/mock/" + transaction.id
    UPDATE Transaction SET paymentUrl = payment_url

    RETURN { transactionId, payment_url, transaction }
```

---

## 4. Spesifikasi Teknis Backend (NestJS & Prisma)

### 4.1. Struktur Modul NestJS

```
backend/src/
├── app.module.ts              # JwtAuthGuard global (APP_GUARD)
├── app.controller.ts          # GET / health check
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts        # login: admin -> customer -> vendor
│   └── auth.controller.ts     # POST /auth
├── admin/
│   ├── admin.controller.ts              # /admins
│   ├── admin-vendor-employee.controller.ts
│   ├── admin-transportation.controller.ts
│   ├── admin-schedule.controller.ts
│   ├── admin-carriage.controller.ts
│   ├── admin-seat.controller.ts
│   ├── admin-transaction.controller.ts
│   └── admin-customer (nested di customer.controller)
├── customer/
│   ├── customer.controller.ts           # register, profile, admin CRUD customers
│   ├── catalog.controller.ts            # GET /customers/schedules
│   └── customer-transaction.controller.ts
├── vendor/
│   └── vendor.controller.ts             # scoped CRUD /vendors/*
├── payment/
│   ├── payment.service.ts
│   └── payment.controller.ts
├── prisma/
│   └── prisma.service.ts                # PrismaPg adapter + DATABASE_URL
└── common/
    ├── guards/ (jwt-auth, roles)
    ├── decorators/ (@Public, @Roles)
    ├── interceptors/ (TransformInterceptor)
    └── filters/ (AllExceptionsFilter)
```

### 4.2. Skema Database (Prisma ORM Text-Based ERD)

```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  CUSTOMER
  VENDOR
}

enum TransportType {
  PLANE
  BUS
  SHIP
}

enum ClassType {
  ECONOMY
  BUSINESS
  FIRST
  VIP
}

enum ScheduleStatus {
  ACTIVE
  CANCELLED
  COMPLETED
}

enum TransactionStatus {
  PENDING
  SUCCESS
  FAILED
}

model Admin {
  id              Int              @id @default(autoincrement())
  username        String           @unique
  password        String
  name            String
  phone           String
  role            Role             @default(ADMIN)
  vendorEmployees VendorEmployee[]
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
}

model Customer {
  id              Int           @id @default(autoincrement())
  username        String        @unique
  password        String
  customer_number String        @unique
  address         String
  name            String
  phone           String
  role            Role          @default(CUSTOMER)
  transactions    Transaction[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model VendorEmployee {
  id               Int              @id @default(autoincrement())
  username         String           @unique
  password         String
  name             String
  phone            String
  transportType    TransportType
  role             Role             @default(VENDOR)
  createdByAdminId Int
  createdByAdmin   Admin            @relation(fields: [createdByAdminId], references: [id])
  transportations  Transportation[]
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
}

model Transportation {
  id        Int             @id @default(autoincrement())
  type      TransportType
  name      String
  code      String          @unique
  capacity  Int
  vendorId  Int?
  vendor    VendorEmployee? @relation(fields: [vendorId], references: [id])
  schedules Schedule[]
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt
}

model Schedule {
  id            Int            @id @default(autoincrement())
  transportId   Int
  transport     Transportation @relation(fields: [transportId], references: [id], onDelete: Cascade)
  origin        String
  destination   String
  departureTime DateTime
  price         Decimal        @db.Decimal(12, 2)
  status        ScheduleStatus @default(ACTIVE)
  carriages     Carriage[]
  transactions  Transaction[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Carriage {
  id             Int       @id @default(autoincrement())
  scheduleId     Int
  schedule       Schedule  @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
  carriageNumber String
  classType      ClassType
  totalSeats     Int
  seats          Seat[]
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  @@unique([scheduleId, carriageNumber])
}

model Seat {
  id           Int           @id @default(autoincrement())
  carriageId   Int
  carriage     Carriage      @relation(fields: [carriageId], references: [id], onDelete: Cascade)
  seatNumber   String
  isAvailable  Boolean       @default(true)
  bookingSeats BookingSeat[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  @@unique([carriageId, seatNumber])
}

model Transaction {
  id              Int               @id @default(autoincrement())
  customerId      Int
  customer        Customer          @relation(fields: [customerId], references: [id])
  scheduleId      Int
  schedule        Schedule          @relation(fields: [scheduleId], references: [id])
  status          TransactionStatus @default(PENDING)
  paymentUrl      String?
  externalOrderId String?           @unique
  totalAmount     Decimal           @db.Decimal(12, 2)
  bookingSeats    BookingSeat[]
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
}

model BookingSeat {
  id            Int         @id @default(autoincrement())
  transactionId Int
  transaction   Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  seatId        Int
  seat          Seat        @relation(fields: [seatId], references: [id])
  @@unique([transactionId, seatId])
}
```

### 4.3. Daftar API Endpoints

| Method | Path URL | Deskripsi | Query Params | Guard Role |
| --- | --- | --- | --- | --- |
| `GET` | `/` | Health check API | - | `Public` |
| `POST` | `/auth` | Login semua role, return JWT | - | `Public` |
| `POST` | `/customers` | Registrasi customer | - | `Public` |
| `GET` | `/customers/me` | Profil customer login | - | `CUSTOMER` |
| `GET` | `/customers/schedules` | Katalog jadwal aktif | `page`, `quantity`, `type`, `origin`, `destination`, `search` | `Public` |
| `GET` | `/customers/schedules/filter` | Filter jadwal | sama seperti atas | `Public` |
| `GET` | `/customers/schedules/:id` | Detail jadwal + kursi | - | `Public` |
| `POST` | `/customers/transactions` | Booking tiket | - | `CUSTOMER` |
| `GET` | `/customers/transactions/me` | Riwayat transaksi | `page`, `quantity` | `CUSTOMER` |
| `GET` | `/customers/transactions/me/:id` | Detail transaksi | - | `CUSTOMER` |
| `GET/POST/PATCH/DELETE` | `/admins` | CRUD admin | `page`, `quantity`, filter | `ADMIN` |
| `GET/POST/PATCH/DELETE` | `/admins/vendor-employees` | CRUD vendor | filter | `ADMIN` |
| `GET/POST/PATCH/DELETE` | `/admins/customers` | CRUD customer (admin) | filter | `ADMIN` |
| `GET/POST/PATCH/DELETE` | `/admins/transportations` | CRUD armada | filter | `ADMIN` |
| `GET/POST/PATCH/DELETE` | `/admins/schedules` | CRUD jadwal | filter | `ADMIN` |
| `GET/POST/PATCH/DELETE` | `/admins/carriages` | CRUD gerbong | filter | `ADMIN` |
| `GET/POST/PATCH/DELETE` | `/admins/seats` | CRUD kursi | filter | `ADMIN` |
| `GET/PATCH` | `/admins/transactions` | Lihat/update transaksi | filter | `ADMIN` |
| `GET` | `/vendors/me` | Profil vendor | - | `VENDOR` |
| `GET/POST/PATCH/DELETE` | `/vendors/transportations` | CRUD armada (scoped) | filter | `VENDOR` |
| `GET/POST/PATCH/DELETE` | `/vendors/schedules` | CRUD jadwal (scoped) | filter | `VENDOR` |
| `GET/POST/PATCH/DELETE` | `/vendors/carriages` | CRUD gerbong (scoped) | filter | `VENDOR` |
| `GET/POST/PATCH/DELETE` | `/vendors/seats` | CRUD kursi (scoped) | filter | `VENDOR` |
| `GET` | `/payments/mock/:transactionId` | Info mock checkout | - | `Public` |
| `POST` | `/payments/mock/:transactionId/pay` | Simulasi pembayaran sukses | - | `Public` |
| `POST` | `/payments/webhook` | Callback payment gateway | - | `Public` |

**Dokumentasi interaktif:** Swagger UI di `/docs`, OpenAPI JSON di `/docs-json`.

**Akun seed (password: `password123`):** `admin`, `vendor_plane`, `vendor_bus`, `vendor_ship`.

#### Contoh JSON Request & Response

##### 1. POST `/customers` (Registrasi Customer)

*Request Body:*

```json
{
  "username": "customer_tropa",
  "password": "password123",
  "customer_number": "3573012345678901",
  "address": "Jl. Veteran No. 10, Malang",
  "name": "Budi Santoso",
  "phone": "081234567890"
}
```

*Response (201 Created):*

```json
{
  "status": "success",
  "message": "Customer berhasil didaftarkan",
  "data": {
    "id": 1,
    "username": "customer_tropa",
    "customer_number": "3573012345678901",
    "name": "Budi Santoso",
    "role": "CUSTOMER"
  }
}
```

##### 2. POST `/auth` (Login)

*Request Body:*

```json
{
  "username": "customer_tropa",
  "password": "password123"
}
```

*Response (200 OK):*

```json
{
  "status": "success",
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

##### 3. GET `/customers/schedules?type=PLANE&origin=Surabaya&page=1&quantity=10`

*Response (200 OK):*

```json
{
  "status": "success",
  "message": "Katalog jadwal berhasil diambil",
  "data": {
    "items": [
      {
        "id": 1,
        "origin": "Surabaya",
        "destination": "Jakarta",
        "departureTime": "2026-06-15T08:00:00.000Z",
        "price": "850000.00",
        "status": "ACTIVE",
        "transport": {
          "id": 1,
          "name": "Garuda Indonesia A330",
          "code": "GA-330",
          "type": "PLANE"
        },
        "carriages": [
          {
            "id": 1,
            "carriageNumber": "A1",
            "classType": "ECONOMY",
            "seats": [
              { "id": 1, "seatNumber": "1A", "isAvailable": true }
            ]
          }
        ]
      }
    ],
    "page": 1,
    "quantity": 10,
    "total": 1
  }
}
```

##### 4. POST `/customers/transactions` (Booking Tiket)

*Request Body:*

```json
{
  "schedule_id": 1,
  "seat_ids": [1, 2]
}
```

*Response (201 Created):*

```json
{
  "status": "success",
  "message": "Transaksi pemesanan tiket berhasil dibuat",
  "data": {
    "transactionId": 1,
    "payment_url": "https://tripi-tropa-production.up.railway.app/payments/mock/1",
    "transaction": {
      "id": 1,
      "status": "PENDING",
      "externalOrderId": "TRP-1717152000000-1",
      "totalAmount": "1700000.00"
    }
  }
}
```

##### 5. POST `/payments/webhook` (Callback Gateway)

*Request Body:*

```json
{
  "order_id": "TRP-1717152000000-1",
  "transaction_status": "success"
}
```

*Response (200 OK):*

```json
{
  "status": "success",
  "message": "Pembayaran berhasil dikonfirmasi",
  "data": {
    "id": 1,
    "status": "SUCCESS"
  }
}
```

**Format error:**

```json
{
  "status": "failed",
  "message": "Salah satu kursi tidak tersedia",
  "data": []
}
```

### 4.4. Environment & Deploy (Railway + Supabase)

| Variable | Fungsi |
| --- | --- |
| `DATABASE_URL` | Koneksi PostgreSQL Supabase (pooler) |
| `JWT_SECRET` | Sign & verify JWT |
| `MOCK_PAYMENT_BASE_URL` | Base URL link pembayaran mock |
| `PUBLIC_URL` | Server Swagger Production |
| `PORT` | Port runtime (Railway set otomatis) |

**Railway (backend):**

- Root Directory: `backend`
- Build: `npx prisma generate && npm run build`
- Start: `node dist/src/main.js`
- Production: `https://tripi-tropa-production.up.railway.app`

---

## 5. Spesifikasi Teknis Frontend (Next.js)

### 5.1. Arsitektur Direktori Next.js (App Router) — Rencana

```
frontend/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Landing + cari jadwal
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── schedules/
│   │   ├── page.tsx                # Katalog (public)
│   │   └── [id]/page.tsx           # Detail + pilih kursi
│   ├── customer/
│   │   ├── profile/page.tsx
│   │   └── transactions/page.tsx
│   ├── admin/
│   │   ├── page.tsx                # Dashboard admin
│   │   ├── vendors/page.tsx
│   │   └── transactions/page.tsx
│   └── vendor/
│       ├── page.tsx                # Dashboard vendor
│       ├── transportations/
│       ├── schedules/
│       └── seats/
├── components/
│   ├── ui/                         # Button, Input, Card
│   ├── Navbar.tsx
│   └── SeatPicker.tsx              # Grid pemilihan kursi
├── lib/
│   └── api.ts                      # Fetch wrapper + Bearer token
└── middleware.ts                   # Protected routes by role
```

### 5.2. Skema Protected Routes Menggunakan Middleware

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  if ((pathname.startsWith('/admin') || pathname.startsWith('/vendor') || pathname.startsWith('/customer')) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const role = payload.role as string;

      if (pathname.startsWith('/admin') && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      if (pathname.startsWith('/vendor') && role !== 'VENDOR') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      if (pathname.startsWith('/customer/transactions') && role !== 'CUSTOMER') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/vendor/:path*', '/customer/:path*'],
};
```

### 5.3. Manajemen State — Keranjang Kursi (Zustand)

```typescript
import { create } from 'zustand';

interface SelectedSeat {
  seatId: number;
  seatNumber: string;
  carriageNumber: string;
}

interface BookingState {
  scheduleId: number | null;
  selectedSeats: SelectedSeat[];
  toggleSeat: (seat: SelectedSeat) => void;
  clearSelection: () => void;
  getSeatCount: () => number;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  scheduleId: null,
  selectedSeats: [],
  toggleSeat: (seat) => set((state) => {
    const exists = state.selectedSeats.find((s) => s.seatId === seat.seatId);
    if (exists) {
      return { selectedSeats: state.selectedSeats.filter((s) => s.seatId !== seat.seatId) };
    }
    return { selectedSeats: [...state.selectedSeats, seat] };
  }),
  clearSelection: () => set({ scheduleId: null, selectedSeats: [] }),
  getSeatCount: () => get().selectedSeats.length,
}));
```

### 5.4. Integrasi API & Mock Payment

- **Base URL:** `NEXT_PUBLIC_API_URL` → lokal `http://localhost:3000` atau Railway production.
- **Login:** `POST /auth` → simpan JWT di cookie HttpOnly atau `localStorage` (development).
- **Katalog:** `GET /customers/schedules` dengan query filter moda dan kota asal.
- **Booking:** `POST /customers/transactions` → redirect user ke `payment_url` atau buka iframe mock checkout.
- **Polling status:** Setelah mock pay, panggil `GET /customers/transactions/me/:id` untuk konfirmasi UI sukses.

---

## 6. Mapping Kriteria Penilaian Sekolah

| Sektor Penilaian | Parameter Kompetensi | Fitur Implementasi pada TripiTropa |
| --- | --- | --- |
| **Inisialisasi Proyek** | Arsitektur berkas & konfigurasi | Monorepo NestJS modular + Next.js App Router; Prisma schema & migrate. |
| **Backend & Database** | CRUD relasional komprehensif | Hierarki Transportation → Schedule → Carriage → Seat; CRUD admin & vendor scoped. |
| **Backend & Database** | Transaksi & keamanan | Booking + lock kursi dalam `$transaction`; bcrypt password; JWT + role guard. |
| **Frontend UI/UX** | Layout responsif | *(Rencana)* katalog jadwal, seat picker, dashboard admin/vendor. |
| **Frontend UI/UX** | State management | *(Rencana)* Zustand untuk pemilihan kursi sebelum checkout. |
| **Integrasi Sistem** | REST API | Swagger `/docs`, Postman collection, format response seragam. |
| **Integrasi Eksternal** | Payment gateway | Mock payment + webhook; rencana Midtrans (`midtrans-client` sudah di dependency). |
| **Deploy** | Hosting production | Railway (API) + Supabase (PostgreSQL). |

---

## 7. Manajemen Proyek (Timeline, Risiko & Mitigasi)

### 7.1. Timeline Pengerjaan (Durasi 6 Minggu, Tim 2 Orang)

```
[Minggu 1: Fondasi & DB]     ======= (BE: NestJS, Prisma, Supabase, seed data)
                             ======= (FE: Next.js, Tailwind, struktur folder)
[Minggu 2: Auth & Role]      ======= (BE: JWT, guards, register customer, admin vendor)
                             ======= (FE: Login, register, simpan token)
[Minggu 3: Master Data]      ======= (BE: Admin + Vendor CRUD transportation/schedule)
                             ======= (FE: Panel vendor + admin shell)
[Minggu 4: Booking & Pay]    ======= (BE: Katalog, booking, mock payment, webhook)
                             ======= (FE: Katalog, SeatPicker, checkout flow)
[Minggu 5: Docs & Deploy]    ======= (BE: Swagger, Railway, Postman collection)
                             ======= (FE: Integrasi API production URL)
[Minggu 6: Uji & Dokumen]    ======= (BE & FE: E2E Postman, bugfix, PRD + demo UKL)
```

### 7.2. Analisis Risiko Teknis & Mitigasi

1. **Risiko: Build Railway gagal — Prisma Client tidak ter-generate**
   *Dampak:* Ratusan error TypeScript (`PrismaClient`, `Role` tidak diekspor).
   *Mitigasi:* Build command wajib `npx prisma generate && npm run build`; opsional `postinstall` prisma generate.

2. **Risiko: Double booking kursi**
   *Dampak:* Dua customer memesan kursi sama.
   *Mitigasi:* Validasi `isAvailable` + update dalam `prisma.$transaction`; pertimbangkan row-level lock di fase lanjut.

3. **Risiko: Webhook payment tidak sampai**
   *Dampak:* User sudah bayar di gateway, status masih PENDING.
   *Mitigasi:* Endpoint `POST /payments/mock/:id/pay` untuk simulasi; nanti tombol "Cek status" polling ke Midtrans.

4. **Risiko: Swagger memanggil localhost di production**
   *Dampak:* "Load failed" saat try it out.
   *Mitigasi:* Set env `PUBLIC_URL`; pilih server **Production** di dropdown Swagger.

5. **Risiko: Typo username saat testing**
   *Dampak:* Login gagal (mis. `costumer_tropa` vs `customer_tropa`).
   *Mitigasi:* Gunakan akun seed & dokumentasi Postman; validasi pesan error konsisten.
