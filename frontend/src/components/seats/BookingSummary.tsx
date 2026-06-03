'use client';

import { useMemo } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { useBookingStore } from '@/stores/bookingStore';

interface BookingSummaryProps {
  routeLabel: string;
  onContinue?: () => void;
  continueLabel?: string;
  isLoading?: boolean;
  showPassengerHint?: boolean;
}

export function BookingSummary({
  routeLabel,
  onContinue,
  continueLabel = 'Lanjutkan',
  isLoading,
  showPassengerHint,
}: BookingSummaryProps) {
  const selectedSeats = useBookingStore((s) => s.selectedSeats);
  const unitPrice = useBookingStore((s) => s.unitPrice);

  const total = useMemo(
    () => unitPrice * selectedSeats.length,
    [unitPrice, selectedSeats.length],
  );

  return (
    <Card className="sticky top-20">
      <CardTitle className="mb-4 !text-base">Ringkasan</CardTitle>
      <p className="text-sm text-slate-600">{routeLabel}</p>

      <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Kursi dipilih</span>
          <span className="font-medium">{selectedSeats.length}</span>
        </div>
        {selectedSeats.length > 0 && (
          <p className="text-xs text-slate-500">
            {selectedSeats.map((s) => s.seatNumber).join(', ')}
          </p>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Harga per kursi</span>
          <span>{formatCurrency(unitPrice)}</span>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-3">
          <span className="font-semibold text-slate-900">Total Harga</span>
          <span className="text-lg font-bold text-primary-700">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {showPassengerHint && selectedSeats.length === 0 && (
        <p className="mt-3 text-xs text-amber-700">
          Pilih minimal satu kursi untuk melanjutkan.
        </p>
      )}

      {onContinue && (
        <Button
          className="mt-4 w-full"
          disabled={selectedSeats.length === 0}
          isLoading={isLoading}
          onClick={onContinue}
        >
          {continueLabel}
        </Button>
      )}
    </Card>
  );
}
