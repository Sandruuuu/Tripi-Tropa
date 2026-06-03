'use client';

import Link from 'next/link';
import { Briefcase, Plane, Coffee, Plug, ChevronDown } from 'lucide-react';
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
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      {type === 'PLANE' ? (
        <Plane className="h-8 w-8 text-slate-400 rotate-45" />
      ) : (
        <span className="text-xl font-bold text-slate-400">
          {type === 'BUS' ? '🚌' : '🚢'}
        </span>
      )}
    </div>
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

  const isCheap = Number(schedule.price) <= 1500000;
  const isAlmostFull = availableSeats > 0 && availableSeats <= 5;

  return (
    <Card className="mb-4 overflow-hidden p-0 border border-slate-200 shadow-sm hover:shadow-card-md transition-shadow bg-white rounded-xl">
      <div className="p-5 sm:p-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between relative">
        
        {/* Badges */}
        <div className="absolute top-4 right-6 flex flex-col items-end gap-1">
          {isCheap && (
            <span className="inline-block rounded-sm bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
              Termurah
            </span>
          )}
          {isAlmostFull && (
            <span className="inline-block rounded-sm bg-red-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-red-600">
              Sisa {availableSeats} Kursi
            </span>
          )}
        </div>

        {/* Left: Identity */}
        <div className="flex items-center gap-4 flex-1">
          <TransportIcon type={schedule.transport.type} />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {schedule.transport.name}
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-1">
              {schedule.transport.code} • Ekonomi
            </p>
          </div>
        </div>

        {/* Middle: Timeline */}
        <div className="flex items-center gap-4 flex-1 justify-center shrink-0 min-w-[250px]">
          <div className="text-right">
            <p className="text-xl font-bold text-slate-900">
              {formatTime(schedule.departureTime)}
            </p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{schedule.origin.slice(0, 3)}</p>
          </div>
          
          <div className="flex flex-col items-center flex-1 px-4">
            <span className="text-[10px] font-semibold text-slate-400 mb-1">{duration}</span>
            <div className="relative w-full flex items-center">
              <div className="h-[2px] w-full bg-slate-200"></div>
              <div className="absolute left-0 h-1.5 w-1.5 rounded-full bg-slate-300"></div>
              <div className="absolute right-0 h-1.5 w-1.5 rounded-full bg-primary-600"></div>
            </div>
            <span className="text-[10px] font-medium text-slate-400 mt-1">Langsung</span>
          </div>

          <div className="text-left">
            <p className="text-xl font-bold text-slate-900">
              {formatTime(arrival)}
            </p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{schedule.destination.slice(0, 3)}</p>
          </div>
        </div>

        {/* Right: Price & CTA */}
        <div className="flex flex-col items-end gap-2 flex-1 sm:mt-6">
          <div className="text-right">
            <p className="text-xl font-bold text-primary-700">
              {formatCurrency(schedule.price)}
            </p>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">/ orang</p>
          </div>
          <Link href={`/schedules/${schedule.id}`}>
            <Button size="sm" className="w-28 font-bold text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-md shadow-sm">
              Pilih
            </Button>
          </Link>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-slate-50/80 px-6 py-3 flex items-center justify-between border-t border-slate-100">
        <div className="flex items-center gap-4 text-primary-600">
          <Briefcase className="h-4 w-4" />
          <Coffee className="h-4 w-4" />
          <Plug className="h-4 w-4" />
        </div>
        <button className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700">
          Detail Penerbangan
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    </Card>
  );
}
