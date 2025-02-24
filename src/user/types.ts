import { IsNumber, IsString, IsEnum } from 'class-validator';
import { Role } from './role.enum';

export class JwtPayload {
  @IsNumber()
  sub: number;

  @IsString()
  email: string;

  @IsEnum(Role, { each: true })
  roles: Role[];

  @IsNumber()
  iat?: number;

  @IsNumber()
  exp?: number;
}