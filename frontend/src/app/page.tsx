'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Bus, Plane, Search, Ship, ShieldCheck, Clock, Heart, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import type { TransportType } from '@/types/api';

const TYPE_OPTIONS = [
  { value: '', label: 'Semua moda' },
  { value: 'PLANE', label: 'Pesawat' },
  { value: 'BUS', label: 'Bus' },
  { value: 'SHIP', label: 'Kapal' },
];

export default function HomePage() {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [type, setType] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (origin.trim()) params.set('origin', origin.trim());
    if (destination.trim()) params.set('destination', destination.trim());
    if (type) params.set('type', type);
    router.push(`/schedules?${params.toString()}`);
  };

  return (
    <div className="space-y-24 pb-16 pt-8">
      {/* Hero Section */}
      <section className="grid items-center gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Perjalanan <span className="text-primary-500">Aman</span> & <span className="text-primary-600">Nyaman</span>
            </h1>
            <p className="max-w-lg text-lg text-slate-500">
              Platform modern untuk memesan tiket pesawat, bus, dan kapal. Pengalaman mulus tanpa hambatan.
            </p>
          </div>

          <Card className="shadow-lg border-slate-100 p-6 rounded-2xl bg-white">
            <form onSubmit={handleSearch} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Kota Asal"
                  placeholder="Contoh: Surabaya"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
                <Input
                  label="Kota Tujuan"
                  placeholder="Contoh: Jakarta"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              <Select
                label="Tipe Transportasi"
                options={TYPE_OPTIONS}
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
              <Button type="submit" className="w-full sm:w-auto mt-2" size="lg">
                <Search className="mr-2 h-5 w-5" />
                Cari Jadwal
              </Button>
            </form>
          </Card>
        </div>
        
        {/* Abstract Placeholder Hero Right */}
        <div className="relative hidden lg:block h-[500px] w-full rounded-3xl overflow-hidden bg-gradient-to-tr from-primary-50 via-primary-100 to-white shadow-[0_20px_50px_rgba(16,185,129,0.1)]">
          <div className="absolute inset-0 backdrop-blur-[60px] bg-white/20"></div>
          {/* Decorative shapes */}
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary-200/50 mix-blend-multiply blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-emerald-100/60 mix-blend-multiply blur-3xl"></div>
          
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="h-64 w-64 rounded-2xl bg-white/40 border border-white/50 shadow-xl backdrop-blur-md transform rotate-12 flex items-center justify-center">
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 opacity-20 blur-md"></div>
             </div>
          </div>
        </div>
      </section>

      {/* Middle Section 1: Product/Service Cards */}
      <section>
        <div className="mb-10 text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Layanan Terbaik Kami</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Kami menyediakan berbagai macam layanan transportasi yang dapat disesuaikan dengan kebutuhan perjalanan Anda.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Penerbangan Reguler', icon: Plane, bg: 'from-emerald-50 to-emerald-100/50' },
            { title: 'Armada Bus Antar Kota', icon: Bus, bg: 'from-slate-50 to-slate-100/50' },
            { title: 'Pelayaran Feri', icon: Ship, bg: 'from-mint-50 to-emerald-50/50' },
            { title: 'Layanan Eksekutif', icon: Heart, bg: 'from-green-50 to-green-100/50' },
          ].map((item, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className={`h-32 w-full bg-gradient-to-br ${item.bg}`}></div>
              <div className="p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500">Pesan tiket dengan mudah, cepat, dan aman melalui platform kami.</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Middle Section 2: Promotions Banners */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-primary-500 p-8 text-white shadow-sm sm:p-10">
          <div className="relative z-10 max-w-sm">
            <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-md">PROMO</span>
            <h3 className="mb-4 text-2xl font-bold sm:text-3xl">Diskon Pengguna Baru</h3>
            <p className="mb-6 text-primary-50">Dapatkan potongan harga hingga 20% untuk pemesanan tiket pertama Anda.</p>
            <Button className="bg-white text-primary-600 hover:bg-slate-50 border-none group">
              Klaim Sekarang
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        </div>
        
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-sm sm:p-10">
          <div className="relative z-10 max-w-sm">
            <span className="mb-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-md">EKSKLUSIF</span>
            <h3 className="mb-4 text-2xl font-bold sm:text-3xl">Layanan Premium</h3>
            <p className="mb-6 text-slate-300">Nikmati akses ruang tunggu eksklusif dan prioritas naik kapal untuk perjalanan.</p>
            <Button className="bg-primary-500 text-white hover:bg-primary-600 border-none group">
              Pelajari Lebih Lanjut
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl"></div>
        </div>
      </section>

      {/* Lower Section: Trust Badges */}
      <section className="border-t border-slate-100 pt-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: 'Pembayaran Aman', desc: 'Transaksi dilindungi dengan enkripsi berlapis' },
            { icon: Clock, title: 'Dukungan 24/7', desc: 'Tim kami siap membantu Anda kapan saja' },
            { icon: CheckCircle2, title: 'Konfirmasi Instan', desc: 'Tiket langsung diterbitkan tanpa menunggu lama' },
            { icon: Heart, title: 'Jaminan Kepuasan', desc: 'Uang kembali jika layanan tidak sesuai' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition-colors hover:bg-primary-100">
                <item.icon className="h-8 w-8" />
              </div>
              <h4 className="mb-2 text-lg font-semibold text-slate-900">{item.title}</h4>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
