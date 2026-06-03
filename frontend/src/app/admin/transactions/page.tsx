'use client';

import { ResourceManager } from '@/components/dashboard/ResourceManager';
import { adminApi } from '@/lib/dashboard-api';
import { adminTransactionConfig } from '@/lib/dashboard-config';

export default function AdminTransactionsPage() {
  return (
    <ResourceManager config={adminTransactionConfig} client={adminApi} />
  );
}
