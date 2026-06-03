/**
 * Konfigurasi form dashboard admin/vendor.
 *
 * - type: "enum" → opsi TETAP di frontend (sesuai enum Prisma: PLANE, BUS, SHIP).
 *   Bukan dari API GET; sama seperti pilihan di database backend.
 * - type: "relation" → opsi dari API (RelationSelect), mis. GET /admins/transportations.
 */
import { formatCurrency, formatDate, transportTypeLabel } from '@/lib/utils';
import type { ResourceConfig } from '@/types/dashboard';

/** Enum TransportType — mirror backend/prisma schema, bukan fetch API */
const TRANSPORT_TYPES = [
  { value: 'PLANE', label: 'Pesawat' },
  { value: 'BUS', label: 'Bus' },
  { value: 'SHIP', label: 'Kapal' },
];

const CLASS_TYPES = [
  { value: 'ECONOMY', label: 'Economy' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'FIRST', label: 'First' },
  { value: 'VIP', label: 'VIP' },
];

const SCHEDULE_STATUS = [
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
  { value: 'COMPLETED', label: 'Selesai' },
];

export const adminVendorConfig: ResourceConfig = {
  title: 'Vendor Employee',
  description: 'Kelola akun vendor per moda transportasi',
  resource: 'vendor-employees',
  canDelete: true,
  columns: [
    { key: 'id', label: 'ID' },
    { key: 'username', label: 'Username' },
    { key: 'name', label: 'Nama' },
    { key: 'phone', label: 'Telepon' },
    {
      key: 'transportType',
      label: 'Moda',
      render: (r) => transportTypeLabel(r.transportType as 'PLANE'),
    },
  ],
  fields: [
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
    { name: 'name', label: 'Nama', type: 'text', required: true },
    { name: 'phone', label: 'Telepon', type: 'tel', required: true },
    {
      name: 'transportType',
      label: 'Tipe transportasi',
      type: 'enum',
      required: true,
      options: TRANSPORT_TYPES,
    },
  ],
};

export const transportationConfig: ResourceConfig = {
  title: 'Armada',
  description: 'Transportasi / maskapai / armada',
  resource: 'transportations',
  canDelete: true,
  columns: [
    { key: 'id', label: 'ID' },
    { key: 'code', label: 'Kode' },
    { key: 'name', label: 'Nama' },
    {
      key: 'type',
      label: 'Moda',
      render: (r) => transportTypeLabel(r.type as 'PLANE'),
    },
    { key: 'capacity', label: 'Kapasitas' },
    {
      key: 'vendor',
      label: 'Vendor',
      render: (r) => {
        const v = r.vendor as { name?: string } | null;
        return v?.name ?? '—';
      },
    },
  ],
  fields: [
    {
      name: 'type',
      label: 'Tipe transportasi',
      type: 'enum',
      required: true,
      options: TRANSPORT_TYPES,
      hideForVendor: true,
    },
    { name: 'name', label: 'Nama armada', type: 'text', required: true },
    { name: 'code', label: 'Kode unik', type: 'text', required: true },
    { name: 'capacity', label: 'Kapasitas', type: 'number', required: true },
    {
      name: 'vendorId',
      label: 'Vendor',
      type: 'relation',
      relationResource: 'vendor-employees',
      relationLabel: (v) =>
        `${v.name} (${transportTypeLabel(v.transportType as 'PLANE')})`,
      hideForVendor: true,
    },
  ],
};

export const scheduleConfig: ResourceConfig = {
  title: 'Jadwal',
  description: 'Jadwal keberangkatan per armada',
  resource: 'schedules',
  canDelete: true,
  canUpdate: true,
  columns: [
    { key: 'id', label: 'ID' },
    {
      key: 'transport',
      label: 'Armada',
      render: (r) => {
        const t = r.transport as { name?: string; code?: string };
        return t ? `${t.name} (${t.code})` : '—';
      },
    },
    { key: 'origin', label: 'Asal' },
    { key: 'destination', label: 'Tujuan' },
    {
      key: 'departureTime',
      label: 'Berangkat',
      render: (r) => formatDate(String(r.departureTime)),
    },
    {
      key: 'price',
      label: 'Harga',
      render: (r) => formatCurrency(String(r.price)),
    },
    { key: 'status', label: 'Status' },
  ],
  fields: [
    {
      name: 'transportId',
      label: 'Armada',
      type: 'relation',
      required: true,
      relationResource: 'transportations',
      relationLabel: (t) => `${t.name} — ${t.code} (${t.type})`,
    },
    { name: 'origin', label: 'Kota asal', type: 'text', required: true },
    { name: 'destination', label: 'Kota tujuan', type: 'text', required: true },
    {
      name: 'departureTime',
      label: 'Waktu berangkat',
      type: 'datetime',
      required: true,
    },
    { name: 'price', label: 'Harga (IDR)', type: 'number', required: true },
    {
      name: 'status',
      label: 'Status',
      type: 'enum',
      options: SCHEDULE_STATUS,
      updateOnly: true,
    },
  ],
};

export const carriageConfig: ResourceConfig = {
  title: 'Gerbong',
  resource: 'carriages',
  canDelete: true,
  columns: [
    { key: 'id', label: 'ID' },
    {
      key: 'schedule',
      label: 'Jadwal',
      render: (r) => {
        const s = r.schedule as {
          origin?: string;
          destination?: string;
          id?: number;
        };
        return s
          ? `#${s.id} ${s.origin} → ${s.destination}`
          : String(r.scheduleId ?? '—');
      },
    },
    { key: 'carriageNumber', label: 'No. Gerbong' },
    { key: 'classType', label: 'Kelas' },
    { key: 'totalSeats', label: 'Total kursi' },
  ],
  fields: [
    {
      name: 'scheduleId',
      label: 'Jadwal',
      type: 'relation',
      required: true,
      relationResource: 'schedules',
      relationLabel: (s) =>
        `#${s.id} ${s.origin} → ${s.destination} (${s.status})`,
    },
    {
      name: 'carriageNumber',
      label: 'Nomor gerbong',
      type: 'text',
      required: true,
    },
    {
      name: 'classType',
      label: 'Kelas',
      type: 'enum',
      required: true,
      options: CLASS_TYPES,
    },
    {
      name: 'totalSeats',
      label: 'Total kursi',
      type: 'number',
      required: true,
    },
  ],
};

export const seatConfig: ResourceConfig = {
  title: 'Kursi',
  resource: 'seats',
  canDelete: true,
  columns: [
    { key: 'id', label: 'ID' },
    {
      key: 'carriage',
      label: 'Gerbong',
      render: (r) => {
        const c = r.carriage as { carriageNumber?: string; scheduleId?: number };
        return c
          ? `${c.carriageNumber} (jadwal #${c.scheduleId})`
          : String(r.carriageId ?? '—');
      },
    },
    { key: 'seatNumber', label: 'No. Kursi' },
    {
      key: 'isAvailable',
      label: 'Tersedia',
      render: (r) => (r.isAvailable ? 'Ya' : 'Tidak'),
    },
  ],
  fields: [
    {
      name: 'carriageId',
      label: 'Gerbong',
      type: 'relation',
      required: true,
      relationResource: 'carriages',
      relationLabel: (c) => {
        const sched = c.schedule as {
          id?: number;
          origin?: string;
          destination?: string;
        };
        if (sched?.origin) {
          return `Gerbong ${c.carriageNumber} — #${sched.id} ${sched.origin}→${sched.destination}`;
        }
        return `Gerbong ${c.carriageNumber} (jadwal #${c.scheduleId})`;
      },
    },
    { name: 'seatNumber', label: 'Nomor kursi', type: 'text', required: true },
    {
      name: 'isAvailable',
      label: 'Tersedia',
      type: 'enum',
      options: [
        { value: 'true', label: 'Ya' },
        { value: 'false', label: 'Tidak' },
      ],
      defaultValue: 'true',
    },
  ],
};

export const adminCustomerConfig: ResourceConfig = {
  title: 'Customer',
  resource: 'customers',
  canCreate: false,
  canDelete: true,
  columns: [
    { key: 'id', label: 'ID' },
    { key: 'username', label: 'Username' },
    { key: 'name', label: 'Nama' },
    { key: 'customer_number', label: 'No. Customer' },
    { key: 'phone', label: 'Telepon' },
  ],
  fields: [
    { name: 'name', label: 'Nama', type: 'text', required: true },
    { name: 'phone', label: 'Telepon', type: 'tel', required: true },
    { name: 'address', label: 'Alamat', type: 'text', required: true },
  ],
};

export const adminTransactionConfig: ResourceConfig = {
  title: 'Transaksi',
  resource: 'transactions',
  canCreate: false,
  canDelete: false,
  canUpdate: true,
  columns: [
    { key: 'id', label: 'ID' },
    {
      key: 'externalOrderId',
      label: 'No. Pesanan',
      render: (r) => String(r.externalOrderId ?? '—'),
    },
    {
      key: 'schedule',
      label: 'Rute',
      render: (r) => {
        const s = r.schedule as { origin?: string; destination?: string };
        return s ? `${s.origin} → ${s.destination}` : '—';
      },
    },
    {
      key: 'totalAmount',
      label: 'Total',
      render: (r) => formatCurrency(String(r.totalAmount)),
    },
    { key: 'status', label: 'Status' },
  ],
  fields: [
    {
      name: 'status',
      label: 'Status',
      type: 'enum',
      required: true,
      options: [
        { value: 'PENDING', label: 'Pending' },
        { value: 'SUCCESS', label: 'Sukses' },
        { value: 'FAILED', label: 'Gagal' },
      ],
      updateOnly: true,
    },
  ],
};
