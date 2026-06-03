'use client';

import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Plus, Trash2 } from 'lucide-react';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { RelationSelect } from '@/components/dashboard/RelationSelect';
import type { DashboardClient } from '@/types/dashboard';
import type { FormFieldConfig, ResourceConfig } from '@/types/dashboard';

const PAGE_SIZE = 10;

interface ResourceManagerProps {
  config: ResourceConfig;
  client: DashboardClient;
  isVendor?: boolean;
}

function emptyForm(
  fields: FormFieldConfig[],
  mode: 'create' | 'update',
  isVendor?: boolean,
) {
  const initial: Record<string, string> = {};
  fields.forEach((f) => {
    if (mode === 'create' && f.updateOnly) return;
    if (mode === 'update' && f.createOnly) return;
    if (isVendorFieldHidden(f, isVendor)) return;
    initial[f.name] =
      f.defaultValue !== undefined ? String(f.defaultValue) : '';
  });
  return initial;
}

function isVendorFieldHidden(f: FormFieldConfig, isVendor?: boolean) {
  return Boolean(isVendor && f.hideForVendor);
}

function visibleFields(
  fields: FormFieldConfig[],
  mode: 'create' | 'update',
  isVendor?: boolean,
) {
  return fields.filter((f) => {
    if (isVendorFieldHidden(f, isVendor)) return false;
    if (mode === 'create' && f.updateOnly) return false;
    if (mode === 'update' && f.createOnly) return false;
    return true;
  });
}

function buildPayload(
  form: Record<string, string>,
  fields: FormFieldConfig[],
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  fields.forEach((f) => {
    const raw = form[f.name];
    if (raw === '' || raw === undefined) return;

    if (f.type === 'number') {
      body[f.name] = Number(raw);
      return;
    }
    if (f.type === 'relation') {
      body[f.name] = Number(raw);
      return;
    }
    if (f.name === 'isAvailable') {
      body[f.name] = raw === 'true';
      return;
    }
    if (f.type === 'datetime') {
      body[f.name] = new Date(raw).toISOString();
      return;
    }
    body[f.name] = raw;
  });
  return body;
}

function toDatetimeLocalValue(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ResourceManager({
  config,
  client,
  isVendor = false,
}: ResourceManagerProps) {

  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, string>>(() =>
    emptyForm(config.fields, 'create', isVendor),
  );

  const [isBulk, setIsBulk] = useState(false);
  const [bulkCount, setBulkCount] = useState('10');
  const [selectedCarriageDetails, setSelectedCarriageDetails] = useState<any>(null);
  const [loadingCarriage, setLoadingCarriage] = useState(false);

  const handleCarriageChange = async (carriageId: string) => {
    setField('carriageId', carriageId);
    if (!carriageId) {
      setSelectedCarriageDetails(null);
      return;
    }
    setLoadingCarriage(true);
    try {
      const res = await client.getOne<any>('carriages', Number(carriageId));
      setSelectedCarriageDetails(res.data);
    } catch (err) {
      console.error('Gagal mengambil detail gerbong:', err);
    } finally {
      setLoadingCarriage(false);
    }
  };

  const canCreate = config.canCreate !== false;
  const canDelete = config.canDelete !== false;
  const canUpdate = config.canUpdate !== false;

  const { data, error, isLoading, mutate } = useSWR(
    [config.resource, page, isVendor],
    () => client.list(config.resource, { page, quantity: PAGE_SIZE }),
    { onError: (e) => toast.error(getErrorMessage(e)) },
  );

  const items = (data?.data.items ?? []) as Record<string, unknown>[];
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const createFields = useMemo(
    () => visibleFields(config.fields, 'create', isVendor),
    [config.fields, isVendor],
  );

  const updateFields = useMemo(
    () => visibleFields(config.fields, 'update', isVendor),
    [config.fields, isVendor],
  );

  const resetCreate = useCallback(() => {
    setForm(emptyForm(config.fields, 'create', isVendor));
    setEditingId(null);
    setShowForm(false);
    setIsBulk(false);
    setBulkCount('10');
    setSelectedCarriageDetails(null);
  }, [config.fields, isVendor]);

  const startEdit = (row: Record<string, unknown>) => {
    const id = Number(row.id);
    const next: Record<string, string> = {};
    updateFields.forEach((f) => {
      if (f.type === 'relation') {
        const relKey = f.name.replace(/Id$/, '');
        const nested = row[relKey] as { id?: number } | undefined;
        next[f.name] = String(
          row[f.name] ?? nested?.id ?? '',
        );
      } else if (f.type === 'datetime') {
        next[f.name] = toDatetimeLocalValue(String(row[f.name] ?? ''));
      } else if (f.name === 'isAvailable') {
        next[f.name] = row.isAvailable ? 'true' : 'false';
      } else {
        next[f.name] = String(row[f.name] ?? '');
      }
    });
    setForm(next);
    setEditingId(id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const showBulkOption = config.resource === 'seats' && !editingId;
    if (showBulkOption && isBulk) {
      const carriageId = form.carriageId;
      if (!carriageId) {
        toast.error('Silakan pilih gerbong terlebih dahulu');
        return;
      }
      
      const count = Number(bulkCount);
      if (isNaN(count) || count <= 0) {
        toast.error('Jumlah kursi tidak valid');
        return;
      }
      
      setLoadingCarriage(true);
      try {
        const res = await client.getOne<any>('carriages', Number(carriageId));
        const carriage = res.data;
        const existingSeats = carriage.seats ?? [];
        const existingNumbers = new Set(existingSeats.map((s: any) => String(s.seatNumber).toUpperCase()));
        
        const type = carriage.schedule?.transport?.type; // 'PLANE' | 'BUS' | 'SHIP'
        const generatedSeats: string[] = [];
        
        let index = 1;
        let seatsFound = 0;
        
        while (seatsFound < count) {
          let seatCode = '';
          if (type === 'PLANE') {
            const row = Math.ceil(index / 6);
            const colIndex = (index - 1) % 6;
            const letter = ['A', 'B', 'C', 'D', 'E', 'F'][colIndex];
            seatCode = `${row}${letter}`;
          } else if (type === 'BUS') {
            const row = Math.ceil(index / 4);
            const colIndex = (index - 1) % 4;
            const letter = ['A', 'B', 'C', 'D'][colIndex];
            seatCode = `${row}${letter}`;
          } else if (type === 'SHIP') {
            seatCode = `S${index}`;
          } else {
            seatCode = `${index}`;
          }
          
          if (!existingNumbers.has(seatCode.toUpperCase())) {
            generatedSeats.push(seatCode);
            seatsFound++;
          }
          index++;
        }
        
        await Promise.all(
          generatedSeats.map((seatNumber) =>
            client.create('seats', {
              carriageId: Number(carriageId),
              seatNumber,
              isAvailable: form.isAvailable === 'true',
            })
          )
        );
        
        toast.success(`Berhasil membuat ${count} kursi secara massal (${generatedSeats.join(', ')})`);
        resetCreate();
        mutate();
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoadingCarriage(false);
      }
      return;
    }

    const fields = editingId ? updateFields : createFields;
    const body = buildPayload(form, fields);

    try {
      if (editingId) {
        await client.update(config.resource, editingId, body);
        toast.success('Data berhasil diperbarui');
      } else {
        await client.create(config.resource, body);
        toast.success('Data berhasil ditambahkan');
      }
      resetCreate();
      mutate();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    try {
      await client.remove(config.resource, id);
      toast.success('Data berhasil dihapus');
      mutate();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const setField = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const renderField = (field: FormFieldConfig) => {
    const value = form[field.name] ?? '';

    if (field.type === 'relation' && field.relationResource) {
      return (
        <RelationSelect
          key={field.name}
          name={field.name}
          label={field.label}
          value={value}
          onChange={(v) => {
            if (config.resource === 'seats' && field.name === 'carriageId') {
              handleCarriageChange(v);
            } else {
              setField(field.name, v);
            }
          }}
          client={client}
          resource={field.relationResource}
          labelFn={
            field.relationLabel ??
            ((item) => `#${item.id} ${item.name ?? item.code ?? ''}`)
          }
          required={field.required}
        />
      );
    }

    if (field.type === 'enum' && field.options) {
      return (
        <div key={field.name}>
          <Select
            label={field.label}
            name={field.name}
            value={value}
            onChange={(e) => setField(field.name, e.target.value)}
            options={field.options}
            placeholder={`Pilih ${field.label.toLowerCase()}`}
            required={field.required}
          />
          <p className="mt-1 text-xs text-slate-500">
            Pilihan tetap (enum backend), bukan dari API.
          </p>
        </div>
      );
    }

    if (field.type === 'datetime') {
      return (
        <Input
          key={field.name}
          label={field.label}
          name={field.name}
          type="datetime-local"
          value={value}
          onChange={(e) => setField(field.name, e.target.value)}
          required={field.required}
        />
      );
    }

    return (
      <Input
        key={field.name}
        label={field.label}
        name={field.name}
        type={
          field.type === 'password'
            ? 'password'
            : field.type === 'number'
              ? 'number'
              : field.type === 'tel'
                ? 'tel'
                : 'text'
        }
        value={value}
        onChange={(e) => setField(field.name, e.target.value)}
        required={field.required}
        readOnly={field.readOnly}
        placeholder={field.placeholder}
      />
    );
  };

  const activeFields = editingId ? updateFields : createFields;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
          {config.description && (
            <p className="mt-1 text-slate-600">{config.description}</p>
          )}
        </div>
        {canCreate && !showForm && (
          <Button
            onClick={() => {
              setForm(emptyForm(config.fields, 'create', isVendor));
              setEditingId(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Tambah
          </Button>
        )}
      </div>

      {showForm && (canCreate || canUpdate) && (
        <Card className="mb-6">
          <CardTitle className="mb-4 !text-base">
            {editingId ? 'Edit' : 'Tambah'} {config.title}
          </CardTitle>
          <form
            onSubmit={handleSubmit}
            className="grid gap-4 sm:grid-cols-2"
          >
            {activeFields.map((field) => {
              if (isBulk && field.name === 'seatNumber') return null;
              return renderField(field);
            })}

            {config.resource === 'seats' && !editingId && (
              <div className="flex flex-col gap-2 sm:col-span-2 border-t border-slate-100 pt-4 mt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="bulk-mode"
                    checked={isBulk}
                    onChange={(e) => setIsBulk(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="bulk-mode" className="text-sm font-semibold text-slate-900">
                    Generate Kursi Massal (Bulk)
                  </label>
                </div>
                
                {isBulk && (
                  <div className="mt-2 grid gap-4 sm:grid-cols-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="sm:col-span-2">
                      <Input
                        label="Jumlah Kursi"
                        type="number"
                        min="1"
                        max="100"
                        value={bulkCount}
                        onChange={(e) => setBulkCount(e.target.value)}
                        placeholder="Misal: 10"
                        required
                      />
                    </div>
                    
                    <div className="sm:col-span-2 text-xs text-slate-600">
                      {loadingCarriage ? (
                        <span className="animate-pulse">Membaca detail gerbong...</span>
                      ) : selectedCarriageDetails ? (
                        <div className="space-y-1">
                          <p>
                            <strong>Tipe Armada:</strong>{' '}
                            {selectedCarriageDetails.schedule?.transport?.type === 'PLANE'
                              ? '✈️ Pesawat'
                              : selectedCarriageDetails.schedule?.transport?.type === 'BUS'
                                ? '🚌 Bus'
                                : '🚢 Kapal'}
                          </p>
                          <p>
                            <strong>Format Penomoran:</strong>{' '}
                            {selectedCarriageDetails.schedule?.transport?.type === 'PLANE'
                              ? '1A, 1B, 1C, 1D, 1E, 1F, 2A... (6 kursi per baris)'
                              : selectedCarriageDetails.schedule?.transport?.type === 'BUS'
                                ? '1A, 1B, 1C, 1D, 2A... (4 kursi per baris)'
                                : 'S1, S2, S3... (Urut)'}
                          </p>
                          <p>
                            <strong>Kursi Terisi Saat Ini:</strong>{' '}
                            {selectedCarriageDetails.seats?.length ?? 0} kursi
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400">Pilih gerbong terlebih dahulu untuk deteksi tipe armada.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit">
                {editingId ? 'Simpan' : 'Buat'}
              </Button>
              <Button type="button" variant="outline" onClick={resetCreate}>
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Memuat…</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            {getErrorMessage(error)}
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Belum ada data.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {config.columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 font-semibold text-slate-700"
                    >
                      {col.label}
                    </th>
                  ))}
                  {(canUpdate || canDelete) && (
                    <th className="px-4 py-3 font-semibold text-slate-700">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((row, idx) => (
                  <tr
                    key={String(row.id)}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}
                  >
                    {config.columns.map((col) => (
                      <td
                        key={col.key}
                        className="border-t border-slate-100 px-4 py-3 text-slate-700"
                      >
                        {col.render
                          ? col.render(row)
                          : String(row[col.key] ?? '—')}
                      </td>
                    ))}
                    {(canUpdate || canDelete) && (
                      <td className="border-t border-slate-100 px-4 py-3">
                        <div className="flex gap-2">
                          {canUpdate && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(row)}
                            >
                              Edit
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(Number(row.id))}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pagination
        className="mt-6"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
