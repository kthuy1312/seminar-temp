import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MulterError } from 'multer';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | string[];

    // ── Multer-specific errors ──────────────────────────────
    if (exception instanceof MulterError) {
      switch (exception.code) {
        case 'LIMIT_FILE_SIZE':
          status = HttpStatus.PAYLOAD_TOO_LARGE;
          message = 'File quá lớn. Kích thước tối đa cho phép là 10 MB.';
          break;
        case 'LIMIT_FILE_COUNT':
          status = HttpStatus.BAD_REQUEST;
          message = 'Chỉ được upload 1 file mỗi request.';
          break;
        case 'LIMIT_UNEXPECTED_FILE':
          status = HttpStatus.BAD_REQUEST;
          message =
            'Tên field không đúng. Dùng field name là "file" trong form-data.';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = `Lỗi upload: ${exception.message}`;
      }

      this.logger.warn(`MulterError [${exception.code}]: ${exception.message}`);
    }
    // ── NestJS / HTTP exceptions ────────────────────────────
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const res = exceptionResponse as any;
        message = res.message || exception.message;
      } else {
        message = exception.message;
      }
    }
    // ── Unknown / unexpected errors ─────────────────────────
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Lỗi hệ thống, vui lòng thử lại sau.';
      this.logger.error('Unhandled exception:', exception);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
