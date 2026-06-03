import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TransportType } from '@/types/api';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(iso));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(iso));
}

export function estimateArrival(departureIso: string, type: TransportType): string {
  const hours =
    type === 'PLANE' ? 2 : type === 'BUS' ? 8 : type === 'SHIP' ? 12 : 4;
  const dep = new Date(departureIso);
  dep.setHours(dep.getHours() + hours);
  return dep.toISOString();
}

export function formatDuration(departureIso: string, type: TransportType): string {
  const hours =
    type === 'PLANE' ? 2 : type === 'BUS' ? 8 : type === 'SHIP' ? 12 : 4;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}j`;
  return `${h}j ${m}m`;
}

export function transportTypeLabel(type: TransportType): string {
  const map: Record<TransportType, string> = {
    PLANE: 'Pesawat',
    BUS: 'Bus',
    SHIP: 'Kapal',
  };
  return map[type];
}

export function transactionStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'Pending',
    SUCCESS: 'Sukses',
    FAILED: 'Gagal',
  };
  return map[status] ?? status;
}

export function getDepartureHour(iso: string): number {
  return new Date(iso).getHours();
}
