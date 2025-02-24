// file: src/user/dto/auth-response.ts
import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../user.entity';

/**
 * Response type for authentication operations.
 */
@ObjectType()
export class AuthResponse {
  /**
   * JWT access token.
   */
  @Field({ description: 'Access token' })
  accessToken: string;

  /**
   * Authenticated user information.
   */
  @Field(() => User, { description: 'User details' })
  user: User;
}