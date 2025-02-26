// src/common/filters/all-exceptions.filter.ts
import { 
    ExceptionFilter, 
    Catch, 
    ArgumentsHost, 
    HttpStatus,
    Logger
  } from '@nestjs/common';
  import { Request, Response } from 'express';

  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);
  
    catch(exception: any, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      
      // Determine status code
      const status =
        exception.status || 
        exception.statusCode || 
        HttpStatus.INTERNAL_SERVER_ERROR;
  
      // Prepare log message
      const logMessage = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        errorName: exception.name || 'UnknownError',
        message: exception.message || 'Internal server error',
        stack: exception.stack,
      };
  
      // Log error with appropriate level based on status
      if (status >= 500) {
        this.logger.error(
          `${request.method} ${request.url} - Internal Server Error`,
          logMessage
        );
      } else {
        this.logger.warn(
          `${request.method} ${request.url} - Client Error`, 
          logMessage
        );
      }
  
      // Send response to client
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: status >= 500 
          ? 'Internal server error' 
          : exception.message || 'Something went wrong',
      });
    }
  }