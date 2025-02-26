// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../../user/enums/role.enum';

/**
 * Key for storing role metadata
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles can access a resource
 * @param roles - List of roles that can access the resource
 * @example
 * @Roles(Role.Admin)
 * @Query(() => [User])
 * findAll() {
 *   return this.userService.findAll();
 * }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);