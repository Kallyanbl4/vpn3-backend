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
import { UpdateUserInput } from './dto/update-user.input';
import { UnauthorizedException } from '@nestjs/common';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  /** Мутация для регистрации нового пользователя */
  @Mutation(() => User)
  async register(@Args('data') data: RegisterUserInput): Promise<User> {
    console.log('Регистрация пользователя:', data.email);
    return this.userService.register(data.email, data.password);
  }

  /** Мутация для аутентификации пользователя и возврата JWT-токена */
  @Mutation(() => AuthResponse)
  async login(@Args('data') { email, password }: LoginInput): Promise<AuthResponse> {
    console.log('Попытка входа для:', email);
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      console.error('Неудачная попытка входа для:', email);
      throw new UnauthorizedException('Неверные учетные данные');
    }
    const payload = { sub: user.id, email: user.email, roles: user.roles };
    const token = await this.jwtService.signAsync(payload);
    console.log('Успешный вход для:', email);
    return { accessToken: token, user };
  }

  /** Запрос для получения данных текущего аутентифицированного пользователя */
  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@Context() context): Promise<User> {
    console.log('Получение данных текущего пользователя:', context.req.user?.email);
    return context.req.user;
  }

  /** Запрос для получения списка всех пользователей (только для админов) */
  @Query(() => [User])
  @UseGuards(GqlAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async users(): Promise<User[]> {
    console.log('Получение списка всех пользователей');
    return this.userService.findAll();
  }

  /** Мутация для обновления данных пользователя */
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateUser(@Args('id') id: number, @Args('data') data: UpdateUserInput): Promise<User> {
    console.log(`Обновление пользователя с ID ${id}:`, data);
    return this.userService.update(id, {
      ...data,
      roles: data.roles ? data.roles.map(role => role as Role) : undefined,
    });
  }
}