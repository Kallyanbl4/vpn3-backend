// src/user/mappers/user.mapper.ts
import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import { User } from '../entities/user.entity';
import { Role } from '../enums/role.enum';

@Injectable()
export class UserMapper {
  /**
   * Преобразует сущность пользователя из Prisma модели в доменную модель
   */
  toDomain(prismaUser: PrismaUser): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      password: prismaUser.password, // Для внутреннего использования
      roles: this.parseRoles(prismaUser.roles),
    };
  }

  /**
   * Преобразует массив сущностей из Prisma в доменные модели
   */
  toDomainList(prismaUsers: PrismaUser[]): User[] {
    return prismaUsers.map(user => this.toDomain(user));
  }

  /**
   * Преобразует роли из строки в массив перечислений
   */
  private parseRoles(rolesStr: string): Role[] {
    if (!rolesStr) {
      return [Role.User]; // По умолчанию обычный пользователь
    }
    return rolesStr.split(',').map(role => role as Role);
  }

  /**
   * Преобразует массив ролей в строку для хранения в БД
   */
  rolesToString(roles: Role[]): string {
    if (!roles || roles.length === 0) {
      return Role.User;
    }
    return roles.join(',');
  }
}