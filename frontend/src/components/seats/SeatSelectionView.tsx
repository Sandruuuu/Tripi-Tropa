'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { schedulesApi, transactionsApi, getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { useBookingStore } from '@/stores/bookingStore';
import { SeatLegend } from '@/components/seats/SeatLegend';
import { BookingSummary } from '@/components/seats/BookingSummary';
import { PassengerForm } from '@/components/seats/PassengerForm';
import { Button } from '@/components/ui/Button';
import type { SelectedSeat } from '@/stores/bookingStore';
import dynamic from 'next/dynamic';

const SeatGrid = dynamic(
  () =>
    import('@/components/seats/SeatGrid').then((m) => ({
      default: m.SeatGrid,
    })),
  {
    loading: () => (
      <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
    ),
    ssr: false,
  },
);

interface SeatSelectionViewProps {
  scheduleId: number;
}

export function SeatSelectionView({ scheduleId }: SeatSelectionViewProps) {
  const router = useRouter();

  const token = useAuthStore((s) => s.token);
  const setSchedule = useBookingStore((s) => s.setSchedule);
  const selectedSeats = useBookingStore((s) => s.selectedSeats);
  const toggleSeat = useBookingStore((s) => s.toggleSeat);
  const clearSelection = useBookingStore((s) => s.clearSelection);

  const [step, setStep] = useState<'seats' | 'passengers'>('seats');
  const [passengersValid, setPassengersValid] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const { data, error, isLoading } = useSWR(
    ['schedule', scheduleId],
    () => schedulesApi.getById(scheduleId),
    { onError: (err) => toast.error(getErrorMessage(err)) },
  );

  const schedule = data?.data;

  useEffect(() => {
    if (schedule) {
      setSchedule(schedule.id, parseFloat(schedule.price));
    }
    return () => clearSelection();
  }, [schedule, setSchedule, clearSelection]);

  const selectedIds = useMemo(
    () => selectedSeats.map((s) => s.seatId),
    [selectedSeats],
  );

  const handleToggle = useCallback(
    (seat: SelectedSeat) => toggleSeat(seat),
    [toggleSeat],
  );

  const handleBook = async () => {
    if (!token) {
      toast.info('Silakan login untuk melanjutkan pemesanan.');
      router.push(`/login?redirect=/schedules/${scheduleId}`);
      return;
    }
    if (!schedule || selectedSeats.length === 0) return;

    setIsBooking(true);
    try {
      const res = await transactionsApi.create({
        schedule_id: schedule.id,
        seat_ids: selectedSeats.map((s) => s.seatId),
      });
      toast.success('Pemesanan berhasil dibuat!');
      const paymentUrl = res.data.payment_url;
      if (paymentUrl) window.location.href = paymentUrl;
      else router.push('/customer/transactions');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 animate-pulse rounded-xl bg-slate-100" />
    );
  }

  if (error || !schedule) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-800">
        {error ? getErrorMessage(error) : 'Jadwal tidak ditemukan.'}
      </div>
    );
  }

  const routeLabel = `${schedule.origin} → ${schedule.destination} · ${schedule.transport.name}`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Pilih Kursi</h1>
        <p className="text-slate-600">{routeLabel}</p>
      </div>

      <div className="mb-4">
        <SeatLegend />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          {step === 'seats' && schedule.carriages && (
            <SeatGrid
              carriages={schedule.carriages}
              selectedSeatIds={selectedIds}
              onToggleSeat={handleToggle}
              columnsPerRow={4}
            />
          )}

          {step === 'passengers' && (
            <div className="space-y-4">
              <PassengerForm onValidChange={setPassengersValid} />
              <Button
                variant="outline"
                onClick={() => setStep('seats')}
              >
                Kembali ke pilih kursi
              </Button>
            </div>
          )}
        </div>

        <aside>
          <BookingSummary
            routeLabel={routeLabel}
            showPassengerHint
            onContinue={
              step === 'seats'
                ? () => {
                    if (selectedSeats.length === 0) {
                      toast.error('Pilih minimal satu kursi.');
                      return;
                    }
                    setStep('passengers');
                  }
                : () => {
                    if (!passengersValid) {
                      toast.error('Lengkapi data penumpang terlebih dahulu.');
                      return;
                    }
                    void handleBook();
                  }
            }
            continueLabel={
              step === 'seats' ? 'Isi data penumpang' : 'Bayar sekarang'
            }
            isLoading={isBooking}
          />
          {step === 'passengers' && !passengersValid && (
            <p className="mt-2 text-xs text-slate-500">
              Lengkapi semua data penumpang sebelum membayar.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
