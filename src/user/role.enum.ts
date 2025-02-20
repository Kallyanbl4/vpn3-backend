// file: src/user/role.enum.ts
import { registerEnumType } from '@nestjs/graphql';

export enum Role {
    User = 'user',
    Admin = 'admin',
}

registerEnumType(Role, {
    name: 'Role', // Имя, которое будет использоваться в GraphQL
    description: 'User roles', // Описание (опционально)
});
  