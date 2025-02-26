// src/auth/guards/role.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from '../../user/enums/role.enum';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Check if the user has the required roles to access a resource
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get the user from the request (GraphQL context)
    const user = this.getUserFromContext(context);
    
    if (!user) {
      throw new ForbiddenException('You must be logged in to access this resource');
    }

    // Check if the user has at least one of the required roles
    const hasRole = this.hasRequiredRoles(user, requiredRoles);
    
    if (!hasRole) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }

  /**
   * Extract the user from the GraphQL context
   */
  private getUserFromContext(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return request.user;
  }

  /**
   * Check if the user has at least one of the required roles
   */
  private hasRequiredRoles(user: any, requiredRoles: Role[]): boolean {
    if (!user || !user.roles) {
      return false;
    }
    
    return requiredRoles.some(role => user.roles.includes(role));
  }
}