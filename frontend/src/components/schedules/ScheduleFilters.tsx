'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import type { Schedule, TransportType } from '@/types/api';

export type DepartureTimeRange = 'all' | '00-06' | '06-12' | '12-18' | '18-24';

export interface ScheduleFilterState {
  types: TransportType[];
  transportId: string;
  departureRange: DepartureTimeRange;
  maxPrice: number;
}

interface ScheduleFiltersProps {
  filters: ScheduleFilterState;
  onChange: (filters: ScheduleFilterState) => void;
  schedules: Schedule[];
}

const TIME_OPTIONS = [
  { value: '00-06', label: '00:00 - 06:00', icon: '🌅' },
  { value: '06-12', label: '06:00 - 12:00', icon: '☀️' },
  { value: '12-18', label: '12:00 - 18:00', icon: '🌤️' },
  { value: '18-24', label: '18:00 - 24:00', icon: '🌙' },
] as const;

export function ScheduleFilters({
  filters,
  onChange,
  schedules,
}: ScheduleFiltersProps) {
  
  const resetFilters = () => {
    onChange({
      types: [],
      transportId: '',
      departureRange: 'all',
      maxPrice: 5000000,
    });
  };

  const setDepartureRange = (val: DepartureTimeRange) => {
    onChange({
      ...filters,
      departureRange: filters.departureRange === val ? 'all' : val,
    });
  };

  return (
    <Card className="sticky top-20 p-0 overflow-hidden border-slate-200 shadow-sm">
      <div className="flex items-center justify-between bg-slate-50 px-5 py-4 border-b border-slate-200">
        <h3 className="text-xs font-bold tracking-wider text-slate-800 uppercase">Filter</h3>
        <button 
          onClick={resetFilters}
          className="text-xs font-bold text-primary-600 hover:text-primary-700 uppercase"
        >
          Reset
        </button>
      </div>

      <div className="p-5 space-y-8">
        
        {/* Waktu Keberangkatan */}
        <div>
          <h4 className="text-xs font-bold tracking-wider text-slate-800 uppercase mb-3">
            Waktu Keberangkatan
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {TIME_OPTIONS.map((opt) => {
              const isActive = filters.departureRange === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setDepartureRange(opt.value)}
                  className={`flex flex-col items-center justify-center rounded-lg border py-3 transition-colors ${
                    isActive 
                      ? 'border-primary-500 bg-primary-50 text-primary-700' 
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-lg mb-1">{opt.icon}</span>
                  <span className="text-[10px] font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Harga */}
        <div>
          <h4 className="text-xs font-bold tracking-wider text-slate-800 uppercase mb-4">
            Harga (Per Orang)
          </h4>
          <div className="px-2">
            <input 
              type="range" 
              min="100000" 
              max="10000000" 
              step="100000"
              value={filters.maxPrice || 5000000}
              onChange={(e) => onChange({...filters, maxPrice: Number(e.target.value)})}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600" 
            />
            <div className="flex justify-between text-xs font-semibold text-slate-700 mt-3">
              <span>Rp 100rb</span>
              <span>Rp {(filters.maxPrice || 5000000) / 1000000}jt</span>
            </div>
          </div>
        </div>

      </div>
    </Card>
  );
}

export function matchesDepartureRange(
  departureIso: string,
  range: DepartureTimeRange,
): boolean {
  if (range === 'all') return true;
  const hour = new Date(departureIso).getHours();
  if (range === '00-06') return hour >= 0 && hour < 6;
  if (range === '06-12') return hour >= 6 && hour < 12;
  if (range === '12-18') return hour >= 12 && hour < 18;
  if (range === '18-24') return hour >= 18 && hour < 24;
  return true;
}

export function applyClientFilters(
  items: Schedule[],
  filters: ScheduleFilterState,
): Schedule[] {
  return items.filter((s) => {
    if (filters.types?.length > 0 && !filters.types.includes(s.transport.type)) {
      return false;
    }
    if (
      filters.transportId &&
      String(s.transportId) !== filters.transportId &&
      String(s.transport.id) !== filters.transportId
    ) {
      return false;
    }
    if (!matchesDepartureRange(s.departureTime, filters.departureRange)) {
      return false;
    }
    if (filters.maxPrice && Number(s.price) > filters.maxPrice) {
      return false;
    }
    return true;
  });
}
