import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/providers/AppProviders';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'TripiTropa — Pemesanan Tiket Transportasi',
  description:
    'Platform pemesanan tiket pesawat, bus, dan kapal multi-moda',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50">
        <AppProviders>
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
