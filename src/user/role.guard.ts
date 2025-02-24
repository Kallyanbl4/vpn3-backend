import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './role.enum';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private getUserFromContext(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  }

  private hasRequiredRoles(user: any, requiredRoles: Role[]) {
    if (!user || !user.roles) return false;
    return requiredRoles.some((role) => user.roles.includes(role));
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const user = this.getUserFromContext(context);
    if (!user) {
      throw new ForbiddenException('Access denied');
    }
    if (!this.hasRequiredRoles(user, requiredRoles)) {
      throw new ForbiddenException('Forbidden resource');
    }
    return true;
  }
}