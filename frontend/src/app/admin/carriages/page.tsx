'use client';

import { ResourceManager } from '@/components/dashboard/ResourceManager';
import { adminApi } from '@/lib/dashboard-api';
import { carriageConfig } from '@/lib/dashboard-config';

export default function AdminCarriagesPage() {
  return <ResourceManager config={carriageConfig} client={adminApi} />;
}
