// file: src/user/user.resolver.ts
import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from './user.entity';
import { UserService } from './user.service';
import { GqlAuthGuard } from './gql-auth.guard';
import { RoleGuard } from './role.guard';
import { Roles } from './roles.decorator';
import { Role } from './role.enum';
import { RegisterUserInput } from './dto/register-user.input';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './dto/auth-response';
import { JwtService } from '@nestjs/jwt';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  @Mutation(() => User)
  async register(@Args('data') data: RegisterUserInput): Promise<User> {
    const user = await this.userService.register(data.email, data.password);
    // В реальном приложении можно сразу отправить подтверждение или автологин
    return user;
  }

  @Mutation(() => AuthResponse)
  async login(@Args('data') { email, password }: LoginInput): Promise<AuthResponse> {
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      throw new Error('Invalid credentials'); // или UnauthorizedException
    }
    // Генерируем JWT-токен. В payload включим идентификатор и роль пользователя.
    const payload = { sub: user.id, email: user.email, roles: user.roles };
    const token = await this.jwtService.signAsync(payload);
    return { accessToken: token, user };
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)  // требуется авторизация JWT
  async me(@Context() context): Promise<User> {
    // Благодаря GqlAuthGuard, в контексте уже есть текущий пользователь:
    const user: User = context.req.user;
    return user;
  }

  @Query(() => [User])
  @UseGuards(GqlAuthGuard, RoleGuard)
  @Roles(Role.Admin)        // только админ
  async users(): Promise<User[]> {
    // Возвращаем всех пользователей (только для админа)
    return this.userService['users'] ?? []; // для простоты, возвращаем массив из сервиса
  }
}
