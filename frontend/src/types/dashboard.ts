import type { ReactNode } from 'react';
import type { createDashboardClient } from '@/lib/dashboard-api';

export type DashboardClient = ReturnType<typeof createDashboardClient>;

export type FieldType =
  | 'text'
  | 'number'
  | 'password'
  | 'tel'
  | 'datetime'
  | 'enum'
  | 'relation'
  | 'boolean';

export interface EnumOption {
  value: string;
  label: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  /** enum */
  options?: EnumOption[];
  /** relation — resource endpoint untuk GET list */
  relationResource?: string;
  relationLabel?: (item: Record<string, unknown>) => string;
  /** Sembunyikan di form vendor (mis. vendorId) */
  hideForVendor?: boolean;
  /** Hanya tampil di form update */
  updateOnly?: boolean;
  /** Hanya tampil di form create */
  createOnly?: boolean;
  readOnly?: boolean;
  defaultValue?: string | number | boolean;
}

export interface ColumnConfig<T = Record<string, unknown>> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
}

export interface ResourceConfig<T = Record<string, unknown>> {
  title: string;
  description?: string;
  resource: string;
  columns: ColumnConfig<T>[];
  fields: FormFieldConfig[];
  canCreate?: boolean;
  canDelete?: boolean;
  canUpdate?: boolean;
}
