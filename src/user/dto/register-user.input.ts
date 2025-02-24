// file: src/user/dto/register-user.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, MinLength } from 'class-validator';

/**
 * Input type for registering a new user.
 */
@InputType()
export class RegisterUserInput {
  /**
   * User's email address.
   */
  @Field({ description: 'User email' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  /**
   * User's password (minimum 6 characters).
   */
  @Field({ description: 'User password' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  // Дополнительные поля (например, имя) можно добавить здесь
}