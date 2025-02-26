// src/user/user.service.ts
import { 
  Injectable, 
  Logger, 
  NotFoundException, 
  ConflictException,
  BadRequestException 
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UserMapper } from './mappers/user.mapper';
import { User } from './entities/user.entity';
import { CacheService } from '../common/cache/cache.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './enums/role.enum';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userMapper: UserMapper,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Создает нового пользователя
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Проверка на существование пользователя с таким email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      this.logger.warn(`Attempted registration with existing email: ${createUserDto.email}`);
      throw new ConflictException('Email is already registered');
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Создание пользователя
    try {
      const prismaUser = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          password: hashedPassword,
          roles: this.userMapper.rolesToString(createUserDto.roles || [Role.User]),
        },
      });

      const user = this.userMapper.toDomain(prismaUser);
      await this.cacheUser(user);
      
      this.logger.log(`User created: ${user.email}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Находит всех пользователей
   */
  async findAll(): Promise<User[]> {
    const prismaUsers = await this.prisma.user.findMany();
    return this.userMapper.toDomainList(prismaUsers);
  }

  /**
   * Находит пользователя по ID
   */
  async findById(id: number): Promise<User> {
    // Пытаемся получить из кэша
    const cacheKey = this.getCacheKey(id);
    const cachedUser = await this.cacheService.get<User>(cacheKey);
    
    if (cachedUser) {
      return cachedUser;
    }

    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!prismaUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const user = this.userMapper.toDomain(prismaUser);
    await this.cacheUser(user);
    
    return user;
  }

  /**
   * Находит пользователя по email
   */
  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email },
    });

    return prismaUser ? this.userMapper.toDomain(prismaUser) : null;
  }

  /**
   * Обновляет пользователя
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Проверяем существование пользователя
    await this.findById(id);

    // Подготавливаем данные для обновления
    const data: any = {};
    
    if (updateUserDto.email) {
      data.email = updateUserDto.email;
    }
    
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    if (updateUserDto.roles) {
      data.roles = this.userMapper.rolesToString(updateUserDto.roles);
    }

    // Обновляем пользователя
    const prismaUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    // Обновляем кэш и возвращаем результат
    const user = this.userMapper.toDomain(prismaUser);
    await this.cacheUser(user);
    
    this.logger.log(`User updated: ${user.email}`);
    return user;
  }

  /**
   * Удаляет пользователя
   */
  async remove(id: number): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      
      // Удаляем из кэша
      await this.cacheService.del(this.getCacheKey(id));
      
      this.logger.log(`User deleted: ID ${id}`);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw error;
    }
  }

  /**
   * Проверяет учетные данные пользователя
   */
  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    return isPasswordValid ? user : null;
  }

  /**
   * Кэширует пользовательские данные
   */
  private async cacheUser(user: User): Promise<void> {
    await this.cacheService.set(this.getCacheKey(user.id), user, 3600);
  }

  /**
   * Создает ключ кэша для пользователя
   */
  private getCacheKey(id: number): string {
    return `user:${id}`;
  }
}