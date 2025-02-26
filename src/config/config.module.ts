// src/config/config.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';
import { AppConfigService } from './app-config.service';
import { AuthConfigService } from './auth-config.service';
import { CacheConfigService } from './cache-config.service';
import { validateConfig } from './config.validation';

/**
 * Module that provides configuration services for the application
 */
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate: validateConfig,
    }),
  ],
  providers: [
    ConfigService,
    AppConfigService,
    AuthConfigService,
    CacheConfigService,
  ],
  exports: [
    ConfigService,
    AppConfigService,
    AuthConfigService,
    CacheConfigService,
  ],
})
export class ConfigModule {}