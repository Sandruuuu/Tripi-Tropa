'use client';

import { ScheduleCard } from './ScheduleCard';
import type { Schedule } from '@/types/api';

interface ScheduleListProps {
  schedules: Schedule[];
  isLoading?: boolean;
}

export function ScheduleList({ schedules, isLoading }: ScheduleListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
        <p className="text-slate-600">Tidak ada jadwal yang cocok.</p>
        <p className="mt-1 text-sm text-slate-500">
          Ubah filter atau kata kunci pencarian Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {schedules.map((schedule) => (
        <ScheduleCard key={schedule.id} schedule={schedule} />
      ))}
    </div>
  );
}
