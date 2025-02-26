// file: src/common/cache.service.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    return this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  // Алиас для del
  async delete(key: string): Promise<void> {
    await this.del(key);
  }

  createKey(...parts: string[]): string {
    return parts.join(':');
  }

  async getOrSet<T>(key: string, factory: () => Promise<T> | T, ttl: number = 3600): Promise<T> {
    const value = await this.get<T>(key);
    if (value !== null && value !== undefined) {
      return value;
    }
    
    const newValue = await factory();
    await this.set(key, newValue, ttl);
    return newValue;
  }
}