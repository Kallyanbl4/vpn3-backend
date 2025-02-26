// src/user/user.resolver.ts
import { Resolver, Mutation, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from './enums/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
  ) {}

  /**
   * Get the list of all users (admin only)
   */
  @Query(() => [User], { description: 'Get all users (Admin only)' })
  @UseGuards(GqlAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async users(): Promise<User[]> {
    return this.userService.findAll();
  }

  /**
   * Get user by ID
   */
  @Query(() => User, { description: 'Get user by ID' })
  @UseGuards(GqlAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async user(@Args('id', { type: () => Int }) id: number): Promise<User> {
    return this.userService.findById(id);
  }

  /**
   * Get current user profile
   */
  @Query(() => User, { description: 'Get current user profile' })
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  /**
   * Update user data
   */
  @Mutation(() => User, { description: 'Update user data' })
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    // Проверяем права доступа: либо текущий пользователь меняет свои данные, либо это администратор
    if (currentUser.id !== id && !currentUser.roles.includes(Role.Admin)) {
      throw new Error('You do not have permission to update this user');
    }
    
    return this.userService.update(id, data);
  }

  /**
   * Delete user (admin only)
   */
  @Mutation(() => Boolean, { description: 'Delete user (Admin only)' })
  @UseGuards(GqlAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async deleteUser(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    await this.userService.remove(id);
    return true;
  }
}