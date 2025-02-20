// file: src/user/user.service.ts
import { Injectable, ConflictException, UnauthorizedException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './user.entity';
import { Role } from './role.enum';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, @Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async register(email: string, password: string): Promise<User> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roles: [Role.User].join(','),
      },
    });
    
    try {
      await this.cacheManager.set(`user:${user.id}`, {
        ...user,
        roles: user.roles.split(',') as Role[],
      }, 3600);
    } catch (cacheError) {
      console.error('Redis caching error:', cacheError);
    }
    return {
      ...user,
      roles: user.roles.split(',') as Role[],
    };
  }

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const passwordMatch = await bcrypt.compare(pass, user.password);
    if (!passwordMatch) {
      return null;
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const cachedUser = await this.cacheManager.get<User | null>(`user_email:${email}`);
      if (cachedUser) {
        return cachedUser;
      }
    } catch (cacheError) {
      console.error('Redis get error:', cacheError);
    }
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      return {
        ...user,
        roles: user.roles.split(',') as Role[],
      };
    }
    return null;
  }

  async findById(id: number): Promise<User | undefined> {
    try {
      const cachedUser = await this.cacheManager.get<User | undefined>(`user:${id}`);
      if (cachedUser) {
        return cachedUser;
      }
    } catch (cacheError) {
      console.error('Redis get error:', cacheError);
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (user) {
      return {
        ...user,
        roles: user.roles.split(',') as Role[],
      };
    }
    return undefined;
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map(user => ({
      ...user,
      roles: user.roles.split(',') as Role[],
    }));
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    const { id: _, ...updateData } = data;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { ...updateData, roles: updateData.roles?.join(',') },
    });
    
    try {
      await this.cacheManager.set(`user:${id}`, {
        ...updatedUser,
        roles: updatedUser.roles.split(',') as Role[],
      }, 3600);
    } catch (cacheError) {
      console.error('Redis caching error:', cacheError);
    }
    return {
      ...updatedUser,
      roles: updatedUser.roles.split(',') as Role[],
    };
  }
}
