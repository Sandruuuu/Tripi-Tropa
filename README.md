# TripiTropa (Fullstack)

Monorepo platform penjualan tiket transportasi multi-moda untuk UKL RPL.

## Struktur

```
Fullstack/
├── backend/   # NestJS + Prisma API
└── frontend/  # Next.js boilerplate
```

## Quick Start

```bash
# Install dependencies (root workspace)
npm install

# Backend
cd backend
cp .env.example .env   # isi DATABASE_URL Supabase
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev

# Frontend (terminal baru)
cd frontend
cp .env.local.example .env.local
npm run dev
```

## Dokumentasi

- Backend API: [backend/README.md](backend/README.md)
- Postman: [backend/postman/TripiTropa.postman_collection.json](backend/postman/TripiTropa.postman_collection.json)
