'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bus, History, LayoutDashboard, Plane, Search, Ship } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';

const customerLinks = [
  { href: '/schedules', label: 'Cari Jadwal', icon: Search },
  { href: '/customer/transactions', label: 'Riwayat', icon: History },
];

export function Navbar() {
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);

  const isDashboard =
    pathname.startsWith('/admin') || pathname.startsWith('/vendor');

  const dashboardHref = role === 'ADMIN' ? '/admin' : role === 'VENDOR' ? '/vendor' : null;

  const navLinks =
    role === 'CUSTOMER' || !role
      ? customerLinks
      : [];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
            <Plane className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900">Tripi<span className="text-primary-600">Tropa</span></span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {!isDashboard &&
            navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname.startsWith(href)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          {dashboardHref && (
            <Link
              href={dashboardHref}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isDashboard
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50',
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden gap-1 sm:flex">
            <Bus className="h-4 w-4 text-slate-400" />
            <Ship className="h-4 w-4 text-slate-400" />
          </div>
          {token ? (
            <Button variant="outline" size="sm" onClick={logout}>
              Keluar
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Masuk
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Daftar</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
