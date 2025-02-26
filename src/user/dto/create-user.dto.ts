// src/user/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { Role } from '../enums/role.enum';

@InputType({ description: 'Create user input' })
export class CreateUserDto {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @Field(() => [Role], { nullable: true, defaultValue: [Role.User] })
  @IsOptional()
  roles?: Role[];
}