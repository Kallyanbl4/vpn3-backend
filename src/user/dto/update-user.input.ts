// file: src/user/dto/update-user.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, MinLength } from 'class-validator';
import { Role } from '../role.enum';

/**
 * Input type for updating user information.
 */
@InputType()
export class UpdateUserInput {
  /**
   * User's email address (optional).
   */
  @Field({ nullable: true, description: 'User email' })
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  /**
   * User's password (optional, minimum 6 characters).
   */
  @Field({ nullable: true, description: 'User password' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  /**
   * User's roles (optional).
   */
  @Field(() => [Role], { nullable: true, description: 'User roles' })
  roles?: Role[];
}