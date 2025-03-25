import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  private readonly logger = new Logger(CatchEverythingFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

  catch(exception: unknown, host: ArgumentsHost) {
    // Get the HTTP adapter
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    // Determine HTTP status
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extract message based on exception type
    let message: string | object;

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      message = typeof response === 'object'
        ? response['message'] || response
        : response;
    } else if (exception instanceof Error) {
      message = exception.message;
    } else {
      message = 'Lỗi hệ thống';
    }

    // Log the error (useful for debugging)
    this.logger.error(
      `Error ${httpStatus} - ${JSON.stringify(message)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Format the response body
    const responseBody = {
      status: false,
      statusCode: httpStatus,
      message: message,
      path: httpAdapter.getRequestUrl(request),
      timestamp: new Date().toISOString(),
    };

    // Standardize error response format
    if (Array.isArray(message)) {
      responseBody.message = message[0]; // Take first validation error for simplicity
    } else if (typeof message === 'object' && message !== null) {
      responseBody.message = JSON.stringify(message);
    }

    // Send the response
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}