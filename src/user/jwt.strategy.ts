// file: src/user/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './types';       // интерфейс для payload (id, email, roles)

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private userService: UserService,
      ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET', 'default_secret'), // <- исправлено!
          });
          
      }
      

  async validate(payload: JwtPayload) {
    // payload содержит данные токена (например, sub, email, roles)
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user; // пользователь будет доступен в запросе (req.user)
  }
}
