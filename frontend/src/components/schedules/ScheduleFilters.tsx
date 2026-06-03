'use client';

import { useMemo } from 'react';
import { Filter } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import type { Schedule, TransportType } from '@/types/api';
import { transportTypeLabel } from '@/lib/utils';

export type DepartureTimeRange = 'all' | 'morning' | 'afternoon' | 'evening';

export interface ScheduleFilterState {
  types: TransportType[];
  transportId: string;
  departureRange: DepartureTimeRange;
}

interface ScheduleFiltersProps {
  filters: ScheduleFilterState;
  onChange: (filters: ScheduleFilterState) => void;
  schedules: Schedule[];
}

const TRANSPORT_TYPES: TransportType[] = ['PLANE', 'BUS', 'SHIP'];

const TIME_OPTIONS = [
  { value: 'all', label: 'Semua waktu' },
  { value: 'morning', label: 'Pagi (06:00–11:59)' },
  { value: 'afternoon', label: 'Siang (12:00–17:59)' },
  { value: 'evening', label: 'Malam (18:00–23:59)' },
];

export function ScheduleFilters({
  filters,
  onChange,
  schedules,
}: ScheduleFiltersProps) {
  const vendorOptions = useMemo(() => {
    const map = new Map<number, string>();
    schedules.forEach((s) => {
      if (s.transport) map.set(s.transport.id, s.transport.name);
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ value: String(id), label: name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [schedules]);

  const toggleType = (type: TransportType) => {
    const types = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onChange({ ...filters, types });
  };

  return (
    <Card className="sticky top-20">
      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-5 w-5 text-primary-600" />
        <CardTitle className="!text-base">Filter</CardTitle>
      </div>

      <div className="space-y-6">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700">
            Tipe transportasi
          </legend>
          <div className="space-y-2">
            {TRANSPORT_TYPES.map((type) => (
              <label
                key={type}
                className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"
              >
                <input
                  type="checkbox"
                  checked={filters.types.includes(type)}
                  onChange={() => toggleType(type)}
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                {transportTypeLabel(type)}
              </label>
            ))}
          </div>
        </fieldset>

        <Select
          label="Maskapai / Vendor"
          placeholder="Semua vendor"
          value={filters.transportId}
          onChange={(e) =>
            onChange({ ...filters, transportId: e.target.value })
          }
          options={vendorOptions}
        />

        <Select
          label="Waktu keberangkatan"
          value={filters.departureRange}
          onChange={(e) =>
            onChange({
              ...filters,
              departureRange: e.target.value as DepartureTimeRange,
            })
          }
          options={TIME_OPTIONS}
        />
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
  if (range === 'morning') return hour >= 6 && hour < 12;
  if (range === 'afternoon') return hour >= 12 && hour < 18;
  return hour >= 18 || hour < 6;
}

export function applyClientFilters(
  items: Schedule[],
  filters: ScheduleFilterState,
): Schedule[] {
  return items.filter((s) => {
    if (filters.types.length > 0 && !filters.types.includes(s.transport.type)) {
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
    return true;
  });
}
