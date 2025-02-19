// file: src/user/user.entity.ts
import { Role } from './role.enum';

export class User {
  id: number;
  email: string;
  password: string;       // захешированный пароль
  roles: Role[];          // роли пользователя
}
// Compare this snippet from src/user/user.service.ts:
// // file: src/user/user.service.ts