'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type { PassengerDetail } from '@/types/api';
import { useBookingStore } from '@/stores/bookingStore';

interface PassengerFormProps {
  onValidChange?: (valid: boolean) => void;
}

export function PassengerForm({ onValidChange }: PassengerFormProps) {
  const selectedSeats = useBookingStore((s) => s.selectedSeats);
  const passengers = useBookingStore((s) => s.passengers);
  const setPassengers = useBookingStore((s) => s.setPassengers);

  const [forms, setForms] = useState<PassengerDetail[]>([]);

  useEffect(() => {
    setForms((prev) => {
      const next: PassengerDetail[] = selectedSeats.map((_, i) => ({
        name: prev[i]?.name ?? passengers[i]?.name ?? '',
        phone: prev[i]?.phone ?? passengers[i]?.phone ?? '',
        idNumber: prev[i]?.idNumber ?? passengers[i]?.idNumber ?? '',
      }));
      return next;
    });
  }, [selectedSeats.length]);

  const duplicateIdNumbers = useMemo(() => {
    const counts = forms.reduce<Record<string, number>>((acc, passenger) => {
      const id = passenger.idNumber.trim();
      if (!id) return acc;
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

    return new Set(
      Object.entries(counts)
        .filter(([, count]) => count > 1)
        .map(([id]) => id),
    );
  }, [forms]);

  const hasDuplicateIdNumbers = duplicateIdNumbers.size > 0;

  const duplicateNames = useMemo(() => {
    const counts = forms.reduce<Record<string, number>>((acc, passenger) => {
      const name = passenger.name.trim().toLowerCase();
      if (!name) return acc;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    return new Set(
      Object.entries(counts)
        .filter(([, count]) => count > 1)
        .map(([name]) => name),
    );
  }, [forms]);

  const hasDuplicateNames = duplicateNames.size > 0;

  useEffect(() => {
    setPassengers(forms);
    const valid =
      forms.length === selectedSeats.length &&
      forms.every((p) => p.name.trim() && p.phone.trim() && p.idNumber.trim()) &&
      !hasDuplicateIdNumbers &&
      !hasDuplicateNames;
    onValidChange?.(valid);
  }, [forms, selectedSeats.length, setPassengers, onValidChange, hasDuplicateIdNumbers, hasDuplicateNames]);

  if (selectedSeats.length === 0) return null;

  const update = (index: number, field: keyof PassengerDetail, value: string) => {
    setForms((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  return (
    <Card>
      <CardTitle className="mb-4 !text-base">Detail Penumpang</CardTitle>
      <div className="space-y-6">
        {selectedSeats.map((seat, index) => {
          const idNumber = forms[index]?.idNumber.trim() ?? '';
          const isDuplicate = idNumber && duplicateIdNumbers.has(idNumber);
          const name = forms[index]?.name.trim().toLowerCase() ?? '';
          const isDuplicateName = name && duplicateNames.has(name);

          return (
            <fieldset
              key={seat.seatId}
              className="rounded-lg border border-slate-200 p-4"
            >
              <legend className="px-1 text-sm font-medium text-slate-800">
                Penumpang {index + 1} — Kursi {seat.seatNumber} (
                {seat.carriageNumber})
              </legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Input
                  label="Nama lengkap"
                  value={forms[index]?.name ?? ''}
                  onChange={(e) => update(index, 'name', e.target.value)}
                  required
                  error={isDuplicateName ? 'Nama tidak boleh sama antar penumpang.' : undefined}
                />
                <Input
                  label="No. telepon"
                  type="tel"
                  value={forms[index]?.phone ?? ''}
                  onChange={(e) => update(index, 'phone', e.target.value)}
                  required
                />
                <Input
                  className="sm:col-span-2"
                  label="No. identitas (KTP/Passport)"
                  value={forms[index]?.idNumber ?? ''}
                  onChange={(e) => update(index, 'idNumber', e.target.value)}
                  required
                  error={isDuplicate ? 'NIK tidak boleh sama antar penumpang.' : undefined}
                />
              </div>
            </fieldset>
          );
        })}
      </div>
      {hasDuplicateNames && (
        <p className="mt-3 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Terdapat nama yang sama di beberapa penumpang. Mohon gunakan nama unik untuk setiap penumpang.
        </p>
      )}
      {hasDuplicateIdNumbers && (
        <p className="mt-3 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Terdapat NIK yang sama di beberapa penumpang. Mohon gunakan NIK unik untuk setiap penumpang.
        </p>
      )}
    </Card>
  );
}
