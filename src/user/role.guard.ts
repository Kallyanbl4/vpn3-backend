// file: src/user/role.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './role.enum';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      // Если роль не указана декоратором, доступ открыт (нет ограничения по ролям)
      return true;
    }
    // Получаем пользователя из GraphQL контекста (req.user должен быть установлен AuthGuard-ом)
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;
    if (!user) {
      // Если по какой-то причине пользователя нет в запросе (не залогинен) – отклоняем
      throw new ForbiddenException('Access denied');
    }
    // Проверяем, содержит ли роль пользователя хотя бы одну из необходимых ролей
    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('Forbidden resource');
    }
    return true;
  }
}
