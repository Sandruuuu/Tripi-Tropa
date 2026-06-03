'use client';

import { ResourceManager } from '@/components/dashboard/ResourceManager';
import { vendorApi } from '@/lib/dashboard-api';
import { transportationConfig } from '@/lib/dashboard-config';

export default function VendorTransportationsPage() {
  return (
    <ResourceManager
      config={transportationConfig}
      client={vendorApi}
      isVendor
    />
  );
}
