'use client';

import { ResourceManager } from '@/components/dashboard/ResourceManager';
import { vendorApi } from '@/lib/dashboard-api';
import { scheduleConfig } from '@/lib/dashboard-config';

export default function VendorSchedulesPage() {
  return (
    <ResourceManager config={scheduleConfig} client={vendorApi} isVendor />
  );
}
