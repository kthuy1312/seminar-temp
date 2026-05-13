import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

/**
 * Chuẩn hóa tất cả response thành format:
 * { success: true, data: {...}, timestamp: "..." }
 *
 * Đồng thời apply class-transformer (loại bỏ @Exclude fields)
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data: instanceToPlain(data) as T,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
