'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { transactionsApi, getErrorMessage } from '@/lib/api';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { TransactionSummary } from '@/components/transactions/TransactionSummary';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import type { TransactionStatus } from '@/types/api';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: '', label: 'Semua status' },
  { value: 'SUCCESS', label: 'Sukses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Gagal' },
];

export default function TransactionsPage() {
  const router = useRouter();

  const token = useAuthStore((s) => s.token);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const { data, error, isLoading, mutate } = useSWR(
    token ? ['transactions', page] : null,
    () => transactionsApi.list(page, PAGE_SIZE),
    {
      onError: (err) => {
        const msg = getErrorMessage(err);
        toast.error(msg);
        if (msg.includes('login')) router.push('/login?redirect=/customer/transactions');
      },
    },
  );

  const items = data?.data.items ?? [];
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filtered = useMemo(() => {
    return items.filter((tx) => {
      if (statusFilter && tx.status !== statusFilter) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const orderId = (tx.externalOrderId ?? String(tx.id)).toLowerCase();
        const vendor = tx.schedule.transport.name.toLowerCase();
        const route =
          `${tx.schedule.origin} ${tx.schedule.destination}`.toLowerCase();
        if (
          !orderId.includes(q) &&
          !vendor.includes(q) &&
          !route.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [items, statusFilter, debouncedSearch]);

  if (!token) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <h1 className="text-xl font-bold text-slate-900">Riwayat Transaksi</h1>
        <p className="mt-2 text-slate-600">
          Login sebagai customer untuk melihat riwayat pemesanan.
        </p>
        <button
          type="button"
          onClick={() =>
            router.push('/login?redirect=/customer/transactions')
          }
          className="mt-4 text-primary-600 hover:underline"
        >
          Masuk sekarang
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        Riwayat Transaksi
      </h1>

      <div className="mb-6">
        <TransactionSummary transactions={items} />
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <Input
          placeholder="Cari nomor pesanan, vendor, atau rute…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Cari transaksi"
        />
        <Select
          label="Filter status"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>

      <TransactionTable transactions={filtered} isLoading={isLoading} />

      <Pagination
        className="mt-6"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {error && (
        <p className="mt-4 text-center text-sm text-red-600">
          {getErrorMessage(error)}
          <button
            type="button"
            className="ml-2 text-primary-600 underline"
            onClick={() => mutate()}
          >
            Coba lagi
          </button>
        </p>
      )}
    </div>
  );
}
