'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Armchair,
  Bus,
  Calendar,
  LayoutDashboard,
  LogOut,
  Train,
  Users,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  children: React.ReactNode;
}

export function DashboardShell({
  title,
  subtitle,
  navItems,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const username = useAuthStore((s) => s.username);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="-mx-4 -mt-8 flex min-h-[calc(100vh-4rem)] sm:-mx-6">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        <div className="sticky top-16 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          )}
          <nav className="mt-6 space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href ||
                (href !== '/admin' &&
                  href !== '/vendor' &&
                  pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 border-t border-slate-100 pt-4">
            <p className="truncate text-sm font-medium text-slate-800">
              {username}
            </p>
            <button
              type="button"
              onClick={logout}
              className="mt-2 flex items-center gap-2 text-sm text-slate-500 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}

export const adminNav: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/vendors', label: 'Vendor', icon: Users },
  { href: '/admin/transportations', label: 'Armada', icon: Bus },
  { href: '/admin/schedules', label: 'Jadwal', icon: Calendar },
  { href: '/admin/carriages', label: 'Gerbong', icon: Train },
  { href: '/admin/seats', label: 'Kursi', icon: Armchair },
  { href: '/admin/transactions', label: 'Transaksi', icon: Wallet },
  { href: '/admin/customers', label: 'Customer', icon: Users },
];

export const vendorNav: NavItem[] = [
  { href: '/vendor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vendor/transportations', label: 'Armada', icon: Bus },
  { href: '/vendor/schedules', label: 'Jadwal', icon: Calendar },
  { href: '/vendor/carriages', label: 'Gerbong', icon: Train },
  { href: '/vendor/seats', label: 'Kursi', icon: Armchair },
];
