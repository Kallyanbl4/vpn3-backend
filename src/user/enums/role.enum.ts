// src/user/enums/role.enum.ts
import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  User = 'user',
  Admin = 'admin',
  SuperAdmin = 'superadmin'
}

registerEnumType(Role, {
  name: 'Role',
  description: 'User roles',
});