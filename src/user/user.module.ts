import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserService } from './user.service';
import { UsersResolver } from './user.resolver';
import { JwtStrategy } from './jwt.strategy';
import { RoleGuard } from './role.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Модуль для управления пользователями, включая аутентификацию и авторизацию.
 */
@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'SECRET_KEY',
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h' },
      }),
    }),
    PrismaModule,
  ],
  providers: [UserService, UsersResolver, JwtStrategy, RoleGuard],
  exports: [JwtModule, UserService], // Экспортируем JwtModule для доступа к JwtService в других модулях
})
export class UserModule {}