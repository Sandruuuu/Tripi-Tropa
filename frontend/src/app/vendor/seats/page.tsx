'use client';

import { ResourceManager } from '@/components/dashboard/ResourceManager';
import { vendorApi } from '@/lib/dashboard-api';
import { seatConfig } from '@/lib/dashboard-config';

export default function VendorSeatsPage() {
  return <ResourceManager config={seatConfig} client={vendorApi} isVendor />;
}
