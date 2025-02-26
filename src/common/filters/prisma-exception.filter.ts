// src/common/filters/prisma-exception.filter.ts
import { 
    ExceptionFilter, 
    Catch, 
    ArgumentsHost, 
    HttpStatus,
    Logger
  } from '@nestjs/common';
  import { Prisma } from '@prisma/client';
  import { Response } from 'express';
  import { GqlArgumentsHost } from '@nestjs/graphql';
  
  @Catch(Prisma.PrismaClientKnownRequestError)
  export class PrismaExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(PrismaExceptionFilter.name);
  
    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
      let ctx;
      let response;
      let path;
      let method;
      
      if (host.getType() === 'http') {
        ctx = host.switchToHttp();
        response = ctx.getResponse() as Response;
        const request = ctx.getRequest();
        path = request.url;
        method = request.method;
      } else {
        // For GraphQL
        ctx = GqlArgumentsHost.create(host);
        const { req } = ctx.getContext();
        response = { 
          status: () => ({ 
            json: (data: Record<string, any>) => data 
          }) 
        };
        path = req?.url || 'GraphQL';
        method = req?.method || 'POST';
      }
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Database error';
  
      // Handle different Prisma errors
      switch (exception.code) {
        case 'P2002': // Unique constraint failed
          status = HttpStatus.CONFLICT;
          message = `Unique constraint violation. Field: ${exception.meta?.target}`;
          break;
        case 'P2025': // Record not found
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
        case 'P2003': // Foreign key constraint failed
          status = HttpStatus.BAD_REQUEST;
          message = 'Related record not found';
          break;
        // Add other error codes as needed
      }
  
      this.logger.error(
        `Database error: ${exception.code}`, 
        {
          code: exception.code,
          meta: exception.meta,
          message: exception.message,
          path,
          method
        }
      );
  
      const errorResponse = {
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path,
      };
  
      return response.status(status).json(errorResponse);
    }
  }