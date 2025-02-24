// file: src/user/dto/login.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, MinLength } from 'class-validator';

/**
 * Input type for user login.
 */
@InputType()
export class LoginInput {
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
}