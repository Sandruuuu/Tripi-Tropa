import axios, { type AxiosError } from 'axios';
import type {
  ApiDetailResponse,
  ApiListResponse,
  BookingResponse,
  CreateBookingPayload,
  LoginPayload,
  LoginResponse,
  Schedule,
  ScheduleQuery,
  Transaction,
} from '@/types/api';

/** Browser memakai proxy `/api` (next.config rewrites) agar tidak kena CORS. */
function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    'https://tripi-tropa-production.up.railway.app'
  );
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (axios.isAxiosError(error)) {
    const ax = error as AxiosError<{ message?: string }>;
    if (!ax.response && ax.message === 'Network Error') {
      return 'Tidak dapat terhubung ke server. Periksa koneksi internet atau restart dev server.';
    }
    const status = ax.response?.status;
    const msg =
      ax.response?.data?.message ||
      ax.message ||
      'Terjadi kesalahan pada server';
    if (status === 400) {
      if (msg.includes('numeric string is expected')) {
        return 'Data tidak valid. Refresh halaman atau hubungi admin jika masalah berlanjut.';
      }
      return msg || 'Permintaan tidak valid';
    }
    if (status === 401) return 'Sesi habis. Silakan login kembali.';
    if (status === 404) return msg || 'Data tidak ditemukan';
    if (status === 500) return 'Server sedang bermasalah. Coba lagi nanti.';
    return msg;
  }
  if (error instanceof Error) return error.message;
  return 'Terjadi kesalahan yang tidak diketahui';
}

export function wrapAxios<T>(promise: Promise<T>): Promise<T> {
  return promise.catch((error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const message =
        (error.response.data as { message?: string })?.message ||
        error.message;
      throw new ApiError(message, status);
    }
    throw error;
  });
}

export const schedulesApi = {
  list: (query: ScheduleQuery) =>
    wrapAxios(
      api
        .get<ApiListResponse<Schedule>>('/customers/schedules', { params: query })
        .then((r) => r.data),
    ),

  getById: (id: number) =>
    wrapAxios(
      api
        .get<ApiDetailResponse<Schedule>>(`/customers/schedules/${id}`)
        .then((r) => r.data),
    ),
};

export const transactionsApi = {
  list: (page = 1, quantity = 10) =>
    wrapAxios(
      api
        .get<ApiListResponse<Transaction>>('/customers/transactions/me', {
          params: { page, quantity },
        })
        .then((r) => r.data),
    ),

  create: (payload: CreateBookingPayload) =>
    wrapAxios(
      api
        .post<ApiDetailResponse<BookingResponse>>(
          '/customers/transactions',
          payload,
        )
        .then((r) => r.data),
    ),
};

export const authApi = {
  login: (payload: LoginPayload) =>
    wrapAxios(
      api
        .post<ApiDetailResponse<LoginResponse>>('/auth', payload)
        .then((r) => r.data),
    ),
};
