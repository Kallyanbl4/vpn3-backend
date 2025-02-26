// src/config/auth-config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from './config.service';

/**
 * Service to access authentication-related configuration values
 */
@Injectable()
export class AuthConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get the JWT secret key used for signing and verifying tokens
   * @throws Error if JWT_SECRET is not defined
   */
  get jwtSecret(): string {
    return this.configService.getOrThrow<string>('JWT_SECRET');
  }

  /**
   * Get the JWT token expiration time
   */
  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN') || '1h';
  }

  /**
   * Get the JWT token issuer claim
   */
  get jwtIssuer(): string {
    return this.configService.get<string>('JWT_ISSUER') || 'nestjs-app';
  }

  /**
   * Get the JWT token audience claim
   */
  get jwtAudience(): string {
    return this.configService.get<string>('JWT_AUDIENCE') || 'nestjs-client';
  }

  /**
   * Get the access token cookie name
   */
  get accessTokenCookieName(): string {
    return this.configService.get<string>('ACCESS_TOKEN_COOKIE_NAME') || 'access_token';
  }

  /**
   * Get the refresh token cookie name
   */
  get refreshTokenCookieName(): string {
    return this.configService.get<string>('REFRESH_TOKEN_COOKIE_NAME') || 'refresh_token';
  }

  /**
   * Get the refresh token expiration time
   */
  get refreshTokenExpiresIn(): string {
    return this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '7d';
  }

  /**
   * Get the secure cookie setting (should be true in production)
   */
  get secureCookie(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }
}