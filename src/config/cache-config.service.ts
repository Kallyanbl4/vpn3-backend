// src/config/cache-config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from './config.service';

/**
 * Service to access cache-related configuration values
 */
@Injectable()
export class CacheConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get the Redis server host
   */
  get redisHost(): string {
    return this.configService.get<string>('REDIS_HOST') || 'localhost';
  }

  /**
   * Get the Redis server port
   */
  get redisPort(): number {
    return this.configService.get<number>('REDIS_PORT') || 6379;
  }

  /**
   * Get the Redis server password (if any)
   */
  get redisPassword(): string | undefined {
    return this.configService.get<string>('REDIS_PASSWORD');
  }

  /**
   * Get the default TTL (Time-To-Live) for cache items in seconds
   */
  get redisTtl(): number {
    return this.configService.get<number>('REDIS_TTL') || 300;
  }

  /**
   * Get the Redis database number
   */
  get redisDb(): number {
    return this.configService.get<number>('REDIS_DB') || 0;
  }

  /**
   * Get the prefix for all Redis keys
   */
  get redisKeyPrefix(): string {
    return this.configService.get<string>('REDIS_KEY_PREFIX') || 'nest:';
  }

  /**
   * Check if Redis TLS connection should be used
   */
  get redisTls(): boolean {
    return this.configService.get<string>('REDIS_TLS') === 'true' || 
           this.configService.get<string>('NODE_ENV') === 'production';
  }

  /**
   * Check if the application is running in production mode
   */
  get isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }

  /**
   * Get a cache-specific configuration value with optional default
   */
  get(key: string, defaultValue?: any): any {
    return this.configService.get(key) ?? defaultValue;
  }
}