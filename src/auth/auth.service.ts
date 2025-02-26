// src/auth/auth.service.ts
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './dto/auth-response';
import { RegisterUserInput } from './dto/register-user.input';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    this.logger.log(`Login attempt for user: ${loginInput.email}`);
    
    const user = await this.validateUser(loginInput.email, loginInput.password);
    if (!user) {
      this.logger.warn(`Failed login attempt for user: ${loginInput.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const token = this.generateToken(user);
    this.logger.log(`User logged in successfully: ${user.email}`);
    
    return { accessToken: token, user };
  }

  async register(registerInput: RegisterUserInput): Promise<User> {
    this.logger.log(`Registering new user: ${registerInput.email}`);
    return this.userService.create(registerInput);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    return this.userService.validateCredentials(email, password);
  }

  generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };
    
    return this.jwtService.sign(payload);
  }

  validateToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }
}