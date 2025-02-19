import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import 'dotenv/config';
import { AppResolver } from './app.resolver';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => ({ req }),
      sortSchema: true,
      playground: process.env.GRAPHQL_PLAYGROUND === 'true', // Use environment variable
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        try {
          const store = await redisStore({
            socket: { 
              host: process.env.REDIS_HOST, 
              port: Number(process.env.REDIS_PORT)
            },
            password: process.env.REDIS_PASSWORD, 
          });

          console.log('✅ Redis успешно подключен к VPS:', process.env.REDIS_HOST);
          return { store, ttl: 5 };
        } catch (error) {
          console.error('❌ Ошибка подключения к Redis:', error);
          throw error;
        }
      },
    }),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(), // Требуем обязательное наличие JWT_SECRET
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
