import { api, wrapAxios } from '@/lib/api';
import type { PaginatedItems } from '@/types/api';

export type DashboardScope = 'admins' | 'vendors';

export interface ListQuery {
  page?: number;
  quantity?: number;
  search?: string;
  status?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface ApiMessageResponse<T> {
  message: string;
  data: T;
}

export interface ApiListResult<T> {
  message: string;
  data: PaginatedItems<T>;
}

function resourcePath(scope: DashboardScope, resource: string) {
  return `/${scope}/${resource}`;
}

/** Query string — konsisten dengan validasi NestJS (@Type Number). */
function toListParams(query?: ListQuery): Record<string, string> | undefined {
  if (!query) return undefined;
  const params: Record<string, string> = {};
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params[key] = String(value);
    }
  });
  return Object.keys(params).length ? params : undefined;
}

export function createDashboardClient(scope: DashboardScope) {
  return {
    list: <T>(resource: string, query?: ListQuery) =>
      wrapAxios(
        api
          .get<ApiListResult<T>>(resourcePath(scope, resource), {
            params: toListParams(query),
          })
          .then((r) => r.data),
      ),

    getOne: <T>(resource: string, id: number) =>
      wrapAxios(
        api
          .get<ApiMessageResponse<T>>(`${resourcePath(scope, resource)}/${id}`)
          .then((r) => r.data),
      ),

    create: <T, B extends object>(resource: string, body: B) =>
      wrapAxios(
        api
          .post<ApiMessageResponse<T>>(resourcePath(scope, resource), body)
          .then((r) => r.data),
      ),

    update: <T, B extends object>(resource: string, id: number, body: B) =>
      wrapAxios(
        api
          .patch<ApiMessageResponse<T>>(
            `${resourcePath(scope, resource)}/${id}`,
            body,
          )
          .then((r) => r.data),
      ),

    remove: (resource: string, id: number) =>
      wrapAxios(
        api
          .delete<ApiMessageResponse<unknown>>(
            `${resourcePath(scope, resource)}/${id}`,
          )
          .then((r) => r.data),
      ),

    getProfile: <T>() =>
      scope === 'vendors'
        ? wrapAxios(
            api.get<ApiMessageResponse<T>>('/vendors/me').then((r) => r.data),
          )
        : Promise.reject(new Error('Profile hanya untuk vendor')),
  };
}

export const adminApi = createDashboardClient('admins');
export const vendorApi = createDashboardClient('vendors');

/** Ambil semua item untuk dropdown relasi (max 100). */
export async function fetchRelationOptions(
  client: ReturnType<typeof createDashboardClient>,
  resource: string,
  labelFn: (item: Record<string, unknown>) => string,
  quantity = 100,
): Promise<{ value: string; label: string }[]> {
  const res = await client.list<Record<string, unknown>>(resource, {
    page: 1,
    quantity,
  });
  return res.data.items.map((item) => ({
    value: String(item.id),
    label: labelFn(item),
  }));
}
