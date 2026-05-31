import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServiceResponse } from '../interfaces/service-response.interface';

export interface ApiResponse<T> {
  status: 'success' | 'failed';
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((result: ServiceResponse<T> | T) => {
        if (
          result &&
          typeof result === 'object' &&
          'message' in result &&
          'data' in result
        ) {
          const typed = result as ServiceResponse<T>;
          return {
            status: 'success' as const,
            message: typed.message,
            data: typed.data,
          };
        }

        return {
          status: 'success' as const,
          message: 'Success',
          data: result as T,
        };
      }),
    );
  }
}
