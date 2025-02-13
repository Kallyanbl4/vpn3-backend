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

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
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
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
