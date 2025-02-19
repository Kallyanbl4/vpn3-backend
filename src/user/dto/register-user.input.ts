// file: src/user/dto/register-user.input.ts
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RegisterUserInput {
  @Field() email: string;
  @Field() password: string;
  // Можно добавить дополнительные поля (имя, и т.д.)
}
