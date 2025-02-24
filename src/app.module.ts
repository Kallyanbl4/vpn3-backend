import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppResolver } from './app.resolver';
import Joi from 'joi';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';

/**
 * Главный модуль приложения, интегрирующий GraphQL, кэширование и управление пользователями.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().optional(),
        REDIS_TTL: Joi.number().default(300),
        GRAPHQL_PLAYGROUND: Joi.boolean().default(false),
        VPN_SERVER_HOST: Joi.string().optional(),
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule, UserModule], // Импортируем UserModule для доступа к JwtService
      inject: [ConfigService, JwtService],
      useFactory: async (configService: ConfigService, jwtService: JwtService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: configService.get<boolean>('GRAPHQL_PLAYGROUND'),
        context: ({ req }) => {
          const token = req.headers.authorization?.split(' ')[1];
          const user = token ? jwtService.verify(token) : null;
          return { req, user };
        },
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('RedisCache');
        const store = await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
            tls: configService.get<string>('NODE_ENV') === 'production',
          },
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
        });
        logger.log(`Redis connected to ${configService.get<string>('REDIS_HOST')}`);
        return {
          store,
          ttl: configService.get<number>('REDIS_TTL'),
        };
      },
    }),
    UserModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}