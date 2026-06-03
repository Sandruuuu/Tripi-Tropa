'use client';

import { ResourceManager } from '@/components/dashboard/ResourceManager';
import { adminApi } from '@/lib/dashboard-api';
import { seatConfig } from '@/lib/dashboard-config';

export default function AdminSeatsPage() {
  return <ResourceManager config={seatConfig} client={adminApi} />;
}
