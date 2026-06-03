import { cn } from '@/lib/utils';
import type { TransactionStatus } from '@/types/api';

const statusStyles: Record<TransactionStatus, string> = {
  SUCCESS: 'bg-emerald-100 text-emerald-800',
  PENDING: 'bg-amber-100 text-amber-800',
  FAILED: 'bg-red-100 text-red-800',
};

export function StatusBadge({ status }: { status: TransactionStatus | string }) {
  const key = status as TransactionStatus;
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusStyles[key] ?? 'bg-slate-100 text-slate-700',
      )}
    >
      {status === 'SUCCESS'
        ? 'Sukses'
        : status === 'PENDING'
          ? 'Pending'
          : status === 'FAILED'
            ? 'Gagal'
            : status}
    </span>
  );
}
