// src/auth/auth.resolver.ts
import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { LoginInput } from './dto/login.input';
import { RegisterUserInput } from './dto/register-user.input';
import { AuthResponse } from './dto/auth-response';

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /**
   * User registration mutation
   */
  @Mutation(() => User)
  async register(@Args('input') registerInput: RegisterUserInput): Promise<User> {
    return this.authService.register(registerInput);
  }

  /**
   * User login mutation
   */
  @Mutation(() => AuthResponse)
  async login(@Args('input') loginInput: LoginInput): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  /**
   * Get the current authenticated user
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async logout(@Context() context): Promise<boolean> {
    // In a stateless JWT authentication, logout is typically handled client-side
    // by removing the token. This is a placeholder for any server-side logout logic
    // that might be needed (like token blacklisting, which would require additional implementation)
    const userId = context.req.user.id;
    return true;
  }
}