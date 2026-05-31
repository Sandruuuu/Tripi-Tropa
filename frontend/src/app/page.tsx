export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-400">
          OmniTiket
        </p>
        <h1 className="mb-4 text-4xl font-bold">TripiTropa</h1>
        <p className="mb-8 text-slate-300">
          Website penjualan tiket Pesawat, Bus, dan Kapal. Frontend boilerplate
          siap dikembangkan — backend API NestJS sudah tersedia.
        </p>
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-left text-sm text-slate-300">
          <p className="font-semibold text-white">Quick start</p>
          <p className="mt-2">Backend: npm run start:dev (port 3000)</p>
          <p>Frontend: npm run dev (port 3001 jika 3000 dipakai backend)</p>
          <p className="mt-2">
            API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}
          </p>
        </div>
      </div>
    </main>
  );
}
