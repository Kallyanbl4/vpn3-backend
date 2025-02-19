// file: src/user/user.service.ts
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { Role } from './role.enum';
// Предположим, что репозиторий или модель пользователя внедряется, например через TypeORM
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  // пример: @InjectRepository(User) private readonly userRepo: Repository<User>
  private users: User[] = []; // временное хранилище вместо БД

  async register(email: string, password: string): Promise<User> {
    // Проверим, что email не занят
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }
    // Хешируем пароль перед сохранением
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user: User = {
      id: Date.now(),  // генерируем ID (упрощенно)
      email,
      password: hashedPassword,
      roles: [Role.User],  // новой учетке присваиваем роль "user"
    };
    this.users.push(user);
    // В случае с БД: await this.userRepo.save(user);
    return user;
  }

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null; // Ошибки не будет, потому что тип User | null
    
    const passwordMatch = await bcrypt.compare(pass, user.password);
    if (!passwordMatch) {
      return null; // Теперь TypeScript не ругается
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null; // Явно указываем `null`, если не найден
  }

  async findById(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }
}
