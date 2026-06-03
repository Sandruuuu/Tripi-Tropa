'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Bus, Plane, Search, Ship } from 'lucide-react';
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
    <div className="mx-auto max-w-3xl">
      <section className="mb-10 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary-600">
          Multi-moda
        </p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Pesan tiket transportasi dengan mudah
        </h1>
        <p className="text-lg text-slate-600">
          Cari jadwal pesawat, bus, dan kapal — pilih kursi, bayar, selesai.
        </p>
        <div className="mt-6 flex justify-center gap-4 text-slate-400">
          <Plane className="h-8 w-8" />
          <Bus className="h-8 w-8" />
          <Ship className="h-8 w-8" />
        </div>
      </section>

      <Card className="shadow-card-md">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Kota asal"
              placeholder="Contoh: Surabaya"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
            <Input
              label="Kota tujuan"
              placeholder="Contoh: Jakarta"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
          <Select
            label="Tipe transportasi"
            options={TYPE_OPTIONS}
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
          <Button type="submit" className="w-full sm:w-auto" size="lg">
            <Search className="h-5 w-5" />
            Cari Jadwal
          </Button>
        </form>
      </Card>
    </div>
  );
}
