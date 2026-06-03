'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { schedulesApi, getErrorMessage } from '@/lib/api';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useToast } from '@/providers/ToastProvider';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import {
  ScheduleFilters,
  applyClientFilters,
  type ScheduleFilterState,
} from '@/components/schedules/ScheduleFilters';
import { ScheduleList } from '@/components/schedules/ScheduleList';
import type { ScheduleQuery, TransportType } from '@/types/api';

const PAGE_SIZE = 8;

const defaultFilters: ScheduleFilterState = {
  types: [],
  transportId: '',
  departureRange: 'all',
};

function SchedulesContent() {
  const searchParams = useSearchParams();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<ScheduleFilterState>(defaultFilters);
  const debouncedSearch = useDebounce(searchInput, 400);

  const origin = searchParams.get('origin') ?? '';
  const destination = searchParams.get('destination') ?? '';
  const typeParam = searchParams.get('type') as TransportType | null;

  const query: ScheduleQuery = useMemo(
    () => ({
      page,
      quantity: PAGE_SIZE,
      ...(origin && { origin }),
      ...(destination && { destination }),
      ...(typeParam && { type: typeParam }),
      ...(debouncedSearch && { search: debouncedSearch }),
    }),
    [page, origin, destination, typeParam, debouncedSearch],
  );

  const { data, error, isLoading } = useSWR(
    ['schedules', query],
    () => schedulesApi.list(query),
    {
      onError: (err) => toast.error(getErrorMessage(err)),
    },
  );

  const items = data?.data.items ?? [];
  const filtered = useMemo(
    () => applyClientFilters(items, filters),
    [items, filters],
  );

  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Hasil Pencarian</h1>
        <p className="mt-1 text-slate-600">
          {origin || destination
            ? `${origin || 'Semua asal'} → ${destination || 'Semua tujuan'}`
            : 'Semua rute aktif'}
          {typeParam ? ` · ${typeParam}` : ''}
        </p>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Cari kota asal atau tujuan…"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(1);
          }}
          aria-label="Pencarian jadwal"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside>
          <ScheduleFilters
            filters={filters}
            onChange={setFilters}
            schedules={items}
          />
        </aside>

        <section>
          <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
            <span>
              Menampilkan {filtered.length} dari {items.length} jadwal (halaman{' '}
              {page})
            </span>
          </div>
          <ScheduleList schedules={filtered} isLoading={isLoading} />
          <Pagination
            className="mt-8"
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </section>
      </div>

      {error && !isLoading && (
        <p className="mt-4 text-center text-sm text-red-600">
          {getErrorMessage(error)}
        </p>
      )}
    </div>
  );
}

export default function SchedulesPage() {
  return (
    <Suspense fallback={<SchedulesPageFallback />}>
      <SchedulesContent />
    </Suspense>
  );
}

function SchedulesPageFallback() {
  return (
    <div className="h-96 animate-pulse rounded-xl bg-slate-100" />
  );
}
