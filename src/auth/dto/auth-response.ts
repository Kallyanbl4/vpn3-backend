// src/auth/dto/auth-response.ts
import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}