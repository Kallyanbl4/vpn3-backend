// src/config/app-config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from './config.service';

/**
 * Service to access application-specific configuration values
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get the application environment (development, production, test)
   */
  get nodeEnv(): string {
    return this.configService.get('NODE_ENV') || 'development';
  }

  /**
   * Check if the application is running in production mode
   */
  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  /**
   * Get the port number the application should listen on
   */
  get port(): number {
    return this.configService.get('PORT') || 3000;
  }

  /**
   * Get the welcome message displayed by the application
   */
  get welcomeMessage(): string {
    return this.configService.get('WELCOME_MESSAGE') || 'Hello World!';
  }

  /**
   * Check if GraphQL playground should be enabled
   */
  get graphqlPlayground(): boolean {
    // Disable playground in production by default
    if (this.isProduction) {
      return this.configService.get('GRAPHQL_PLAYGROUND') === true;
    }
    return this.configService.get('GRAPHQL_PLAYGROUND') !== false;
  }

  /**
   * Get the host of the VPN server
   */
  get vpnServerHost(): string {
    return this.configService.get('VPN_SERVER_HOST') || 'localhost';
  }

  /**
   * Get application URL for client redirection
   */
  get appUrl(): string {
    return this.configService.get('APP_URL') || `http://localhost:${this.port}`;
  }

  /**
   * Get application name
   */
  get appName(): string {
    return this.configService.get('APP_NAME') || 'NestJS Application';
  }

  /**
   * Get API prefix for all routes
   */
  get apiPrefix(): string {
    return this.configService.get('API_PREFIX') || 'api';
  }

  /**
   * Get the allowed CORS origins
   */
  get corsOrigins(): string[] {
    const origins = this.configService.get('CORS_ORIGINS');
    if (!origins) {
      return this.isProduction ? [] : ['http://localhost:3000'];
    }
    
    if (typeof origins === 'string') {
      return origins.split(',').map(origin => origin.trim());
    }
    
    return Array.isArray(origins) ? origins : [];
  }

  /**
   * Get a specific config value with optional default
   */
  get(key: string, defaultValue?: any): any {
    return this.configService.get(key) ?? defaultValue;
  }
}