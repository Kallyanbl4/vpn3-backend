// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '../config/config.module';
import { CacheModule } from '../common/cache/cache.module';
import { UserMapper } from './mappers/user.mapper';

/**
 * Модуль для управления пользователями.
 */
@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CacheModule,
  ],
  providers: [
    UserService, 
    UserResolver,
    UserMapper
  ],
  exports: [UserService, UserMapper],
})
export class UserModule {}