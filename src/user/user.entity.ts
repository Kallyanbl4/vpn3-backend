// file: src/user/user.entity.ts
import { ObjectType, Field } from '@nestjs/graphql';
import { Role } from './role.enum';

@ObjectType()
export class User {
  @Field()
  id: number;

  @Field()
  email: string;

  password: string; // захешированный пароль (не добавляем в GraphQL схему)

  @Field(() => [Role])
  roles: Role[];
}
