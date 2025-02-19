// file: src/user/dto/login.input.ts
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LoginInput {
  @Field() email: string;
  @Field() password: string;
}