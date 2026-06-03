'use client';

import {
  DashboardShell,
  adminNav,
} from '@/components/dashboard/DashboardShell';
import { RoleGuard } from '@/components/dashboard/RoleGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowed="ADMIN" loginPath="/admin">
      <DashboardShell title="Admin" subtitle="TripiTropa" navItems={adminNav}>
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
