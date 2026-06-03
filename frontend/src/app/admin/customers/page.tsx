'use client';

import { ResourceManager } from '@/components/dashboard/ResourceManager';
import { adminApi } from '@/lib/dashboard-api';
import { adminCustomerConfig } from '@/lib/dashboard-config';

export default function AdminCustomersPage() {
  return <ResourceManager config={adminCustomerConfig} client={adminApi} />;
}
