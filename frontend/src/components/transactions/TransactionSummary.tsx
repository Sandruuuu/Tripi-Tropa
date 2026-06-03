'use client';

import { useMemo } from 'react';
import { Wallet } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/types/api';

interface TransactionSummaryProps {
  transactions: Transaction[];
}

export function TransactionSummary({ transactions }: TransactionSummaryProps) {
  const totalSpent = useMemo(
    () =>
      transactions
        .filter((t) => t.status === 'SUCCESS')
        .reduce((sum, t) => sum + parseFloat(t.totalAmount), 0),
    [transactions],
  );

  const successCount = transactions.filter((t) => t.status === 'SUCCESS').length;

  return (
    <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-primary-100">
            Total Pengeluaran
          </p>
          <p className="mt-1 text-3xl font-bold">
            {formatCurrency(totalSpent)}
          </p>
          <p className="mt-2 text-sm text-primary-100">
            {successCount} transaksi sukses (halaman ini)
          </p>
        </div>
        <span className="rounded-xl bg-white/20 p-3">
          <Wallet className="h-8 w-8" />
        </span>
      </div>
    </Card>
  );
}
