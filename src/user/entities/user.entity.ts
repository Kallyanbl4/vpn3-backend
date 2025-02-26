// src/user/entities/user.entity.ts
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Role } from '../enums/role.enum';

@ObjectType({ description: 'User object' })
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  // Password is not exposed in GraphQL
  password: string;

  @Field(() => [Role])
  roles: Role[];

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}