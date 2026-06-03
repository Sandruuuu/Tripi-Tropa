'use client';

import { ResourceManager } from '@/components/dashboard/ResourceManager';
import { adminApi } from '@/lib/dashboard-api';
import { scheduleConfig } from '@/lib/dashboard-config';

export default function AdminSchedulesPage() {
  return <ResourceManager config={scheduleConfig} client={adminApi} />;
}
