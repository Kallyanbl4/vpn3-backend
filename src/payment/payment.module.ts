import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentResolver } from './payment.resolver';
import { PaymentMapper } from './mappers/payment.mapper';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '../config/config.module';
import { CacheModule } from '../common/cache/cache.module';
import { UserModule } from '../user/user.module';

/**
 * Модуль для управления платежами
 */
@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CacheModule,
    UserModule,
  ],
  providers: [
    PaymentService, 
    PaymentResolver,
    PaymentMapper
  ],
  exports: [PaymentService, PaymentMapper],
})
export class PaymentModule {}