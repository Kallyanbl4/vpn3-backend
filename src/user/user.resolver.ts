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
import { UpdateUserInput } from './dto/update-user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // Mutation to register a new user
  @Mutation(() => User)
  async register(@Args('data') data: RegisterUserInput): Promise<User> {
    console.log('Registering user:', data.email);
    return this.userService.register(data.email, data.password);
  }

  // Mutation to authenticate a user and return a JWT token
  @Mutation(() => AuthResponse)
  async login(@Args('data') { email, password }: LoginInput): Promise<AuthResponse> {
    console.log('Attempting login for:', email);
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      console.error('Login failed for:', email);
      throw new Error('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email, roles: user.roles };
    const token = await this.jwtService.signAsync(payload);
    console.log('Login successful for:', email);
    return { accessToken: token, user };
  }

  // Query to fetch the currently authenticated user's details
  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@Context() context): Promise<User> {
    console.log('Fetching current user:', context.req.user?.email);
    return context.req.user;
  }

  // Query to retrieve all users (restricted to admin role)
  @Query(() => [User])
  @UseGuards(GqlAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async users(): Promise<User[]> {
    console.log('Fetching all users');
    return this.userService.findAll();
  }

  // Mutation to update a user's information
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateUser(@Args('id') id: number, @Args('data') data: UpdateUserInput): Promise<User> {
    console.log(`Updating user with ID ${id}:`, data);
    return this.userService.update(id, {
      ...data,
      roles: data.roles ? data.roles.map(role => role as Role) : undefined,
    });
  }
}
