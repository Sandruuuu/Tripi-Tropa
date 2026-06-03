'use client';

import { ResourceManager } from '@/components/dashboard/ResourceManager';
import { vendorApi } from '@/lib/dashboard-api';
import { carriageConfig } from '@/lib/dashboard-config';

export default function VendorCarriagesPage() {
  return (
    <ResourceManager config={carriageConfig} client={vendorApi} isVendor />
  );
}
