// src/auth/dto/register-user.input.ts
import { InputType, Field, HideField } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional, IsArray } from 'class-validator';
import { Role } from '../../user/enums/role.enum';

@InputType()
export class RegisterUserInput {
  @Field()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(50, { message: 'Password must be at most 50 characters long' })
  password: string;

  // Roles are optional and typically not provided during registration
  // They will be hidden from GraphQL schema
  @HideField()
  @IsOptional()
  @IsArray()
  roles?: Role[];
}