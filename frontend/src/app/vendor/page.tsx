'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/Card';
import { vendorNav } from '@/components/dashboard/DashboardShell';
import { vendorApi } from '@/lib/dashboard-api';
import { transportTypeLabel } from '@/lib/utils';

export default function VendorDashboardPage() {
  const { data } = useSWR('vendor-me', () => vendorApi.getProfile<{
    id: number;
    name: string;
    username: string;
    phone: string;
    transportType: 'PLANE' | 'BUS' | 'SHIP';
  }>());

  const profile = data?.data;
  const links = vendorNav.filter((n) => n.href !== '/vendor');

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        Dashboard Vendor
      </h1>
      {profile && (
        <Card className="mb-8 border-primary-100 bg-primary-50/50">
          <p className="text-sm text-slate-600">Selamat datang</p>
          <p className="text-lg font-semibold text-slate-900">{profile.name}</p>
          <p className="text-sm text-slate-600">
            @{profile.username} ·{' '}
            {transportTypeLabel(profile.transportType)} · {profile.phone}
          </p>
        </Card>
      )}
      <p className="mb-6 text-slate-600">
        Siapkan armada → jadwal → gerbong → kursi. Pilih relasi dari dropdown
        saat membuat data baru.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-card-md">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-primary-50 p-2 text-primary-600">
                  <Icon className="h-5 w-5" />
                </span>
                <CardTitle className="!text-base">{label}</CardTitle>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
