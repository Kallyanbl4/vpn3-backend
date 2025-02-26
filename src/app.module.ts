// src/app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { APP_FILTER } from '@nestjs/core';

// Filters
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

// Modules
import { ConfigModule } from './config/config.module';
import { CacheModule } from './common/cache/cache.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TariffModule } from './tariff/tariff.module';

// Services and Controllers
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppResolver } from './app.resolver';
import { AppConfigService } from './config/app-config.service';
import { JwtService } from '@nestjs/jwt';

/**
 * Главный модуль приложения, интегрирующий все компоненты системы.
 */
@Module({
  imports: [
    // Загрузка конфигурации
    ConfigModule,
    
    // Настройка кэширования
    CacheModule,
    
    // GraphQL API
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule, AuthModule],
      inject: [AppConfigService, JwtService],
      useFactory: async (configService: AppConfigService, jwtService: JwtService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: configService.graphqlPlayground,
        context: ({ req }) => {
          const token = req.headers.authorization?.split(' ')[1];
          const user = token ? jwtService.verify(token) : null;
          return { req, user };
        },
      }),
    }),
    
    // Доступ к базе данных
    PrismaModule,
    
    // Функциональные модули
    UserModule,
    AuthModule,
    TariffModule, // Добавлен новый модуль тарифов
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppResolver,
    // Глобальные фильтры исключений
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}