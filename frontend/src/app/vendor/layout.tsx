'use client';

import {
  DashboardShell,
  vendorNav,
} from '@/components/dashboard/DashboardShell';
import { RoleGuard } from '@/components/dashboard/RoleGuard';
import { useAuthStore } from '@/stores/authStore';
import { transportTypeLabel } from '@/lib/utils';

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const transportType = useAuthStore((s) => s.transportType);
  const subtitle = transportType
    ? transportTypeLabel(transportType)
    : 'Vendor';

  return (
    <RoleGuard allowed="VENDOR" loginPath="/vendor">
      <DashboardShell title="Vendor" subtitle={subtitle} navItems={vendorNav}>
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
