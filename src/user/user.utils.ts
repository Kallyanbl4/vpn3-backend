import { Role } from './role.enum';
import { User as AppUser } from './user.entity'; // Rename to AppUser for clarity
import { User as PrismaUser } from '@prisma/client'; // Import Prisma's User type

export function parseRoles(roles: string): Role[] {
  return roles.split(',') as Role[];
}

export function formatUser(prismaUser: PrismaUser): AppUser {
  return {
    ...prismaUser,
    roles: parseRoles(prismaUser.roles), // Convert string to Role[]
  };
}