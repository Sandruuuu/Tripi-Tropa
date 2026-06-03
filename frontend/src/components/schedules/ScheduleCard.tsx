'use client';

import Link from 'next/link';
import { ArrowRight, Clock, Plane } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Schedule } from '@/types/api';
import {
  estimateArrival,
  formatCurrency,
  formatDuration,
  formatTime,
  transportTypeLabel,
} from '@/lib/utils';

interface ScheduleCardProps {
  schedule: Schedule;
}

function TransportIcon({ type }: { type: string }) {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
      <Plane className="h-6 w-6" />
    </span>
  );
}

export function ScheduleCard({ schedule }: ScheduleCardProps) {
  const arrival = estimateArrival(
    schedule.departureTime,
    schedule.transport.type,
  );
  const duration = formatDuration(
    schedule.departureTime,
    schedule.transport.type,
  );
  const availableSeats =
    schedule.carriages?.reduce(
      (sum, c) => sum + (c.seats?.filter((s) => s.isAvailable).length ?? 0),
      0,
    ) ?? 0;

  return (
    <Card className="transition-shadow hover:shadow-card-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <TransportIcon type={schedule.transport.type} />
          <div>
            <p className="font-semibold text-slate-900">
              {schedule.transport.name}
            </p>
            <p className="text-xs text-slate-500">
              {transportTypeLabel(schedule.transport.type)} ·{' '}
              {schedule.transport.code}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {schedule.origin}{' '}
              <ArrowRight className="inline h-3 w-3" />{' '}
              {schedule.destination}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 sm:gap-8">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">
              {formatTime(schedule.departureTime)}
            </p>
            <p className="text-xs text-slate-500">{schedule.origin}</p>
          </div>
          <div className="flex flex-col items-center text-slate-400">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium text-slate-500">{duration}</span>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">
              {formatTime(arrival)}
            </p>
            <p className="text-xs text-slate-500">{schedule.destination}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 border-t border-slate-100 pt-4 sm:border-0 sm:pt-0">
          <p className="text-xl font-bold text-primary-700">
            {formatCurrency(schedule.price)}
          </p>
          <p className="text-xs text-slate-500">
            {availableSeats > 0
              ? `${availableSeats} kursi tersedia`
              : 'Cek ketersediaan'}
          </p>
          <Link href={`/schedules/${schedule.id}`}>
            <Button size="sm">Pilih</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
