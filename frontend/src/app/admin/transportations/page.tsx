'use client';

import { ResourceManager } from '@/components/dashboard/ResourceManager';
import { adminApi } from '@/lib/dashboard-api';
import { transportationConfig } from '@/lib/dashboard-config';

export default function AdminTransportationsPage() {
  return (
    <ResourceManager config={transportationConfig} client={adminApi} />
  );
}
