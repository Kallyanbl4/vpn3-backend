import { Module } from '@nestjs/common';
import { TariffService } from './tariff.service';
import { TariffResolver } from './tariff.resolver';
import { TariffMapper } from './mappers/tariff.mapper';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '../config/config.module';
import { CacheModule } from '../common/cache/cache.module';

/**
 * Модуль для управления тарифными планами
 */
@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CacheModule,
  ],
  providers: [
    TariffService, 
    TariffResolver,
    TariffMapper
  ],
  exports: [TariffService, TariffMapper],
})
export class TariffModule {}