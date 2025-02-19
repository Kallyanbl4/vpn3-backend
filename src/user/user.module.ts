// file: src/user/user.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserService } from './user.service';
import { UsersResolver } from './user.resolver';
import { JwtStrategy } from './jwt.strategy';
import { RoleGuard } from './role.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }), 
    JwtModule.register({
      global: true,              // JWT модуль будет глобальным (Nest v10+)
      secret: process.env.JWT_SECRET || 'SECRET_KEY', 
      signOptions: { expiresIn: '1h' }, // срок действия токена (напр. 1 час)
    }),
    // тут можно импортировать TypeOrmModule.forFeature([User]) или др. для репозитория
  ],
  providers: [UserService, UsersResolver, JwtStrategy, RoleGuard],
})
export class UserModule {}
