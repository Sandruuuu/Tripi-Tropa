'use client';

import { ResourceManager } from '@/components/dashboard/ResourceManager';
import { adminApi } from '@/lib/dashboard-api';
import { adminVendorConfig } from '@/lib/dashboard-config';

export default function AdminVendorsPage() {
  return <ResourceManager config={adminVendorConfig} client={adminApi} />;
}
