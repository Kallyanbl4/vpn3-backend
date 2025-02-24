import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { User as AppUser } from './user.entity'; // Тип пользователя в приложении
import { Role } from './role.enum';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { formatUser } from './user.utils';
import { User as PrismaUser } from '@prisma/client'; // Тип пользователя в Prisma

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /** Регистрация нового пользователя */
  async register(email: string, password: string): Promise<AppUser> {
    const existing: PrismaUser | null = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email уже зарегистрирован');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user: PrismaUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roles: [Role.User].join(','), // Сохраняем роли как строку в базе данных
      },
    });
    const formattedUser: AppUser = formatUser(user); // Преобразуем в тип AppUser
    await this.cacheManager.set(`user:${user.id}`, formattedUser, 3600).catch((err) => {
      console.error('Ошибка кэширования в Redis:', err);
    });
    return formattedUser;
  }

  /** Проверка учетных данных пользователя */
  async validateUser(email: string, password: string): Promise<AppUser | null> {
    const user: PrismaUser | null = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null; // Пользователь не найден
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return null; // Пароль не совпадает
    }
    return formatUser(user); // Возвращаем преобразованного пользователя
  }

  /** Поиск пользователя по email */
  async findByEmail(email: string): Promise<AppUser | null> {
    const user: PrismaUser | null = await this.prisma.user.findUnique({ where: { email } });
    return user ? formatUser(user) : null; // Преобразуем или возвращаем null
  }

  /** Поиск пользователя по ID */
  async findById(id: number): Promise<AppUser | null> {
    const user: PrismaUser | null = await this.prisma.user.findUnique({ where: { id } });
    return user ? formatUser(user) : null; // Преобразуем или возвращаем null
  }

  /** Получение списка всех пользователей */
  async findAll(): Promise<AppUser[]> {
    const users: PrismaUser[] = await this.prisma.user.findMany();
    return users.map(formatUser); // Преобразуем каждого пользователя в тип AppUser
  }

  /** Обновление данных пользователя */
  async update(id: number, data: Partial<AppUser>): Promise<AppUser> {
    const user: PrismaUser | null = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    const updatedUser: PrismaUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        roles: data.roles ? data.roles.join(',') : user.roles, // Преобразуем массив ролей в строку
      },
    });
    const formattedUser: AppUser = formatUser(updatedUser); // Преобразуем в тип AppUser
    await this.cacheManager.set(`user:${id}`, formattedUser, 3600).catch((err) => {
      console.error('Ошибка кэширования в Redis:', err);
    });
    return formattedUser;
  }
}