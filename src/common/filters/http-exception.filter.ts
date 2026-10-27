import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Error interno del servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null && 'message' in res) {
        message = (res as any).message;
        if (Array.isArray(message)) {
          message = message.join(', ');
        }
      } else if (typeof res === 'string') {
        message = res;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof QueryFailedError) {
      const driverError = (exception as any).driverError;
      if (driverError && driverError.code === '23505') {
        status = HttpStatus.CONFLICT;
        message = driverError.detail || 'Conflicto de clave única en la base de datos';
      } else {
        status = HttpStatus.BAD_REQUEST;
        message = driverError?.message || exception.message;
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      message = exception.message || 'Error inesperado del servidor';
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
