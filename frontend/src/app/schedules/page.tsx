'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Plane } from 'lucide-react';
import { schedulesApi, getErrorMessage } from '@/lib/api';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
  maxPrice: 5000000,
};

type SortOption = 'Termurah' | 'Tercepat' | 'Awal' | 'Akhir';

function SchedulesContent() {
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ScheduleFilterState>(defaultFilters);
  const [sortOption, setSortOption] = useState<SortOption>('Termurah');

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
    }),
    [page, origin, destination, typeParam],
  );

  const { data, error, isLoading } = useSWR(
    ['schedules', query],
    () => schedulesApi.list(query),
    {
      onError: (err) => toast.error(getErrorMessage(err)),
    },
  );

  const items = data?.data.items ?? [];
  const filtered = useMemo
    (() => applyClientFilters(items, filters),
    [items, filters]
  );

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortOption === 'Termurah') {
      arr.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOption === 'Awal') {
      arr.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
    } else if (sortOption === 'Akhir') {
      arr.sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime());
    }
    return arr;
  }, [filtered, sortOption]);

  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      {/* Top Summary Box */}
      <Card className="mb-6 border border-slate-200 shadow-sm p-4 flex items-center justify-between bg-white rounded-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Plane className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {origin || 'Semua Asal'} → {destination || 'Semua Tujuan'}
            </h1>
            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })} | 1 Penumpang | Ekonomi
            </p>
          </div>
        </div>
        <Button variant="outline" className="border-primary-600 text-primary-600 font-semibold hover:bg-primary-50 uppercase text-xs tracking-wider h-10 px-6">
          Ganti Pencarian
        </Button>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside>
          <ScheduleFilters
            filters={filters}
            onChange={setFilters}
            schedules={items}
          />
        </aside>

        <section>
          {/* Sorting Bar */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'Termurah', label: 'Termurah' },
              { id: 'Tercepat', label: 'Tercepat' },
              { id: 'Awal', label: 'Keberangkatan Paling Awal' },
              { id: 'Akhir', label: 'Kedatangan Paling Akhir' },
            ].map((sort) => (
              <button
                key={sort.id}
                onClick={() => setSortOption(sort.id as SortOption)}
                className={`flex-none rounded-full px-5 py-2 text-sm font-semibold transition-colors border ${
                  sortOption === sort.id
                    ? 'border-primary-600 bg-primary-600 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {sort.label}
              </button>
            ))}
          </div>

          <ScheduleList schedules={sorted} isLoading={isLoading} />
          
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
