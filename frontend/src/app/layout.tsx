import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TripiTropa',
  description: 'Platform penjualan tiket transportasi multi-moda',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
