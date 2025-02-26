// src/config/config.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

/**
 * Base configuration service that provides type-safe access to environment variables
 */
@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor(private readonly nestConfigService: NestConfigService) {}

  /**
   * Get a configuration value by key
   * @param key The configuration key
   * @returns The configuration value or undefined if not found
   */
  get<T>(key: string): T | undefined {
    const value = this.nestConfigService.get<T>(key);
    return value;
  }

  /**
   * Get a required configuration value by key
   * @param key The configuration key
   * @throws Error if the configuration value is undefined
   * @returns The configuration value
   */
  getOrThrow<T>(key: string): T {
    const value = this.nestConfigService.get<T>(key);
    if (value === undefined) {
      this.logger.error(`Configuration key "${key}" is not defined`);
      throw new Error(`Configuration key "${key}" is not defined`);
    }
    return value;
  }

  /**
   * Check if a configuration value exists
   * @param key The configuration key
   * @returns True if the configuration value exists, otherwise false
   */
  has(key: string): boolean {
    return this.nestConfigService.get(key) !== undefined;
  }
}