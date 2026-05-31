export interface ServiceResponse<T = unknown> {
  message: string;
  data: T;
}
