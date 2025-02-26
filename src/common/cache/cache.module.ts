// src/common/cache/cache.module.ts
import { Module, Logger } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheService } from './cache.service';
import { ConfigModule } from '../../config/config.module';
import { CacheConfigService } from '../../config/cache-config.service';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [CacheConfigService],
      useFactory: async (cacheConfig: CacheConfigService) => {
        const logger = new Logger('RedisCache');
        
        try {
          const store = await redisStore({
            socket: {
              host: cacheConfig.redisHost,
              port: cacheConfig.redisPort,
              tls: cacheConfig.isProduction,
            },
            password: cacheConfig.redisPassword || undefined,
          });
          
          logger.log(`Redis connected to ${cacheConfig.redisHost}:${cacheConfig.redisPort}`);
          
          return {
            store,
            ttl: cacheConfig.redisTtl,
          };
        } catch (error) {
          logger.error(`Failed to connect to Redis: ${error.message}`, error.stack);
          throw error;
        }
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}