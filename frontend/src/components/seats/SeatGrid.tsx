'use client';

import { useCallback, useMemo } from 'react';
import type { Carriage, Seat } from '@/types/api';
import { cn } from '@/lib/utils';
import type { SelectedSeat } from '@/stores/bookingStore';

export type SeatStatus = 'available' | 'selected' | 'occupied';

interface SeatGridProps {
  carriages: Carriage[];
  selectedSeatIds: number[];
  onToggleSeat: (seat: SelectedSeat) => void;
  columnsPerRow?: number;
}

function groupSeatsIntoRows(seats: Seat[], columnsPerRow: number): Seat[][] {
  const sorted = [...seats].sort((a, b) =>
    a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true }),
  );
  const rows: Seat[][] = [];
  for (let i = 0; i < sorted.length; i += columnsPerRow) {
    rows.push(sorted.slice(i, i + columnsPerRow));
  }
  return rows;
}

function SeatButton({
  seat,
  status,
  onClick,
}: {
  seat: Seat;
  status: SeatStatus;
  onClick: () => void;
}) {
  const occupied = status === 'occupied';
  return (
    <button
      type="button"
      disabled={occupied}
      onClick={onClick}
      title={`Kursi ${seat.seatNumber}`}
      aria-label={`Kursi ${seat.seatNumber}, ${occupied ? 'terisi' : status === 'selected' ? 'dipilih' : 'tersedia'}`}
      aria-pressed={status === 'selected'}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-md border text-xs font-medium transition-colors',
        status === 'available' &&
          'border-slate-300 bg-white text-slate-700 hover:border-primary-500 hover:bg-primary-50',
        status === 'selected' &&
          'border-primary-600 bg-primary-600 text-white',
        status === 'occupied' &&
          'cursor-not-allowed border-slate-300 bg-slate-200 text-slate-400',
      )}
    >
      {seat.seatNumber}
    </button>
  );
}

export function SeatGrid({
  carriages,
  selectedSeatIds,
  onToggleSeat,
  columnsPerRow = 4,
}: SeatGridProps) {
  const selectedSet = useMemo(
    () => new Set(selectedSeatIds),
    [selectedSeatIds],
  );

  const getStatus = useCallback(
    (seat: Seat): SeatStatus => {
      if (!seat.isAvailable) return 'occupied';
      if (selectedSet.has(seat.id)) return 'selected';
      return 'available';
    },
    [selectedSet],
  );

  const handleToggle = useCallback(
    (seat: Seat, carriage: Carriage) => {
      if (!seat.isAvailable) return;
      onToggleSeat({
        seatId: seat.id,
        seatNumber: seat.seatNumber,
        carriageId: carriage.id,
        carriageNumber: carriage.carriageNumber,
      });
    },
    [onToggleSeat],
  );

  return (
    <div className="space-y-8">
      {carriages.map((carriage) => {
        const rows = groupSeatsIntoRows(carriage.seats, columnsPerRow);
        const half = Math.ceil(columnsPerRow / 2);

        return (
          <div key={carriage.id}>
            <h4 className="mb-3 text-sm font-semibold text-slate-800">
              Gerbong {carriage.carriageNumber} · {carriage.classType}
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
                Depan
              </div>
              <div className="flex flex-col items-center gap-2">
                {rows.map((row, rowIdx) => {
                  const left = row.slice(0, half);
                  const right = row.slice(half);
                  return (
                    <div
                      key={rowIdx}
                      className="flex items-center justify-center gap-6"
                    >
                      <div className="flex gap-1.5">
                        {left.map((seat) => (
                          <SeatButton
                            key={seat.id}
                            seat={seat}
                            status={getStatus(seat)}
                            onClick={() => handleToggle(seat, carriage)}
                          />
                        ))}
                      </div>
                      <div className="w-8" aria-hidden />
                      <div className="flex gap-1.5">
                        {right.map((seat) => (
                          <SeatButton
                            key={seat.id}
                            seat={seat}
                            status={getStatus(seat)}
                            onClick={() => handleToggle(seat, carriage)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
