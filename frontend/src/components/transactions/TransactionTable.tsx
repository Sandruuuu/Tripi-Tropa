'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import {
  formatCurrency,
  formatDate,
  transactionStatusLabel,
} from '@/lib/utils';
import type { Transaction, TransactionStatus } from '@/types/api';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export function TransactionTable({
  transactions,
  isLoading,
}: TransactionTableProps) {
  const rows = useMemo(() => transactions, [transactions]);

  if (isLoading) {
    return (
      <Card padding="none">
        <div className="animate-pulse p-8 text-center text-slate-500">
          Memuat riwayat transaksi…
        </div>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card>
        <p className="text-center text-slate-600">
          Belum ada transaksi yang cocok dengan filter.
        </p>
      </Card>
    );
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 font-semibold text-slate-700">
                No. Pesanan
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Produk / Vendor
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">Rute</th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Tanggal
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Total
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Status
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tx, idx) => (
              <tr
                key={tx.id}
                className={
                  idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'
                }
              >
                <td className="border-t border-slate-100 px-4 py-3 font-mono text-xs text-slate-600">
                  {tx.externalOrderId ?? `#${tx.id}`}
                </td>
                <td className="border-t border-slate-100 px-4 py-3">
                  <p className="font-medium text-slate-900">
                    {tx.schedule.transport.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {tx.schedule.transport.code}
                  </p>
                </td>
                <td className="border-t border-slate-100 px-4 py-3 text-slate-600">
                  {tx.schedule.origin} → {tx.schedule.destination}
                </td>
                <td className="border-t border-slate-100 px-4 py-3 text-slate-600">
                  {formatDate(tx.createdAt)}
                </td>
                <td className="border-t border-slate-100 px-4 py-3 font-medium text-slate-900">
                  {formatCurrency(tx.totalAmount)}
                </td>
                <td className="border-t border-slate-100 px-4 py-3">
                  <StatusBadge
                    status={tx.status as TransactionStatus}
                  />
                  <span className="sr-only">
                    {transactionStatusLabel(tx.status)}
                  </span>
                </td>
                <td className="border-t border-slate-100 px-4 py-3">
                  {tx.status === 'PENDING' && tx.paymentUrl ? (
                    <a
                      href={tx.paymentUrl}
                      className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all duration-150"
                    >
                      Bayar Sekarang
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
