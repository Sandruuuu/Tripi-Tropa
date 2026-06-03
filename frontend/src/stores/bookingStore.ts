'use client';

import { create } from 'zustand';
import type { PassengerDetail } from '@/types/api';

export interface SelectedSeat {
  seatId: number;
  seatNumber: string;
  carriageId: number;
  carriageNumber: string;
}

interface BookingState {
  scheduleId: number | null;
  unitPrice: number;
  selectedSeats: SelectedSeat[];
  passengers: PassengerDetail[];
  setSchedule: (scheduleId: number, unitPrice: number) => void;
  toggleSeat: (seat: SelectedSeat) => void;
  clearSelection: () => void;
  setPassengers: (passengers: PassengerDetail[]) => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  scheduleId: null,
  unitPrice: 0,
  selectedSeats: [],
  passengers: [],
  setSchedule: (scheduleId, unitPrice) =>
    set({ scheduleId, unitPrice, selectedSeats: [], passengers: [] }),
  toggleSeat: (seat) =>
    set((state) => {
      const exists = state.selectedSeats.some((s) => s.seatId === seat.seatId);
      if (exists) {
        return {
          selectedSeats: state.selectedSeats.filter(
            (s) => s.seatId !== seat.seatId,
          ),
        };
      }
      return { selectedSeats: [...state.selectedSeats, seat] };
    }),
  clearSelection: () =>
    set({ scheduleId: null, unitPrice: 0, selectedSeats: [], passengers: [] }),
  setPassengers: (passengers) => set({ passengers }),
}));

export function useBookingTotal() {
  const unitPrice = useBookingStore((s) => s.unitPrice);
  const count = useBookingStore((s) => s.selectedSeats.length);
  return unitPrice * count;
}
