'use client';

import useSWR from 'swr';
import { Select } from '@/components/ui/Select';
import type { DashboardClient } from '@/types/dashboard';
import { getErrorMessage } from '@/lib/api';
import { fetchRelationOptions } from '@/lib/dashboard-api';

interface RelationSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  client: DashboardClient;
  resource: string;
  labelFn: (item: Record<string, unknown>) => string;
  required?: boolean;
  placeholder?: string;
}

export function RelationSelect({
  label,
  name,
  value,
  onChange,
  client,
  resource,
  labelFn,
  required,
  placeholder = 'Pilih…',
}: RelationSelectProps) {
  const { data, error, isLoading } = useSWR(
    ['relation', resource],
    () =>
      fetchRelationOptions(client, resource, labelFn),
    { revalidateOnFocus: false },
  );

  const options = data ?? [];

  return (
    <Select
      label={label}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={
        isLoading
          ? 'Memuat…'
          : error
            ? 'Gagal memuat'
            : options.length === 0
              ? 'Tidak ada data'
              : placeholder
      }
      options={options}
      disabled={isLoading || Boolean(error) || options.length === 0}
    />
  );
}

export function useRelationOptions(
  client: DashboardClient,
  resource: string | undefined,
  labelFn: (item: Record<string, unknown>) => string,
) {
  return useSWR(
    resource ? ['relation', resource] : null,
    () =>
      resource
        ? fetchRelationOptions(client, resource, labelFn)
        : [],
    { onError: (e) => console.error(getErrorMessage(e)) },
  );
}
