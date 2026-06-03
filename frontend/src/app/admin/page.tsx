'use client';

import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/Card';
import { adminNav } from '@/components/dashboard/DashboardShell';

export default function AdminDashboardPage() {
  const links = adminNav.filter((n) => n.href !== '/admin');

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Dashboard Admin</h1>
      <p className="mb-8 text-slate-600">
        Kelola vendor, inventori tiket, dan transaksi. Field relasi memakai
        dropdown — tidak perlu mengetik ID manual.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="transition-shadow hover:shadow-card-md">
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
