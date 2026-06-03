export type TransportType = 'PLANE' | 'BUS' | 'SHIP';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
export type ClassType = 'ECONOMY' | 'BUSINESS' | 'FIRST' | 'VIP';

export interface Transport {
  id: number;
  name: string;
  code: string;
  type: TransportType;
}

export interface Seat {
  id: number;
  seatNumber: string;
  isAvailable: boolean;
}

export interface Carriage {
  id: number;
  carriageNumber: string;
  classType: ClassType;
  totalSeats?: number;
  seats: Seat[];
}

export interface Schedule {
  id: number;
  transportId: number;
  origin: string;
  destination: string;
  departureTime: string;
  price: string;
  status: string;
  transport: Transport;
  carriages?: Carriage[];
}

export interface PaginatedItems<T> {
  items: T[];
  page: number;
  quantity: number;
  total: number;
}

export interface ApiListResponse<T> {
  status?: string;
  message: string;
  data: PaginatedItems<T>;
}

export interface ApiDetailResponse<T> {
  status?: string;
  message: string;
  data: T;
}

export interface Transaction {
  id: number;
  customerId: number;
  scheduleId: number;
  status: TransactionStatus;
  paymentUrl: string | null;
  externalOrderId: string | null;
  totalAmount: string;
  createdAt: string;
  schedule: Schedule;
  bookingSeats: {
    id: number;
    seatId: number;
    seat: Seat & { carriage?: Carriage };
  }[];
}

export interface CreateBookingPayload {
  schedule_id: number;
  seat_ids: number[];
}

export interface BookingResponse {
  transactionId: number;
  payment_url: string;
  transaction: Transaction;
}

export interface ScheduleQuery {
  page?: number;
  quantity?: number;
  type?: TransportType;
  origin?: string;
  destination?: string;
  search?: string;
  transportId?: number;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface PassengerDetail {
  name: string;
  phone: string;
  idNumber: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  customer_number: string;
  address: string;
  name: string;
  phone: string;
}
