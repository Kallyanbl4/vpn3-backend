// src/user/dto/update-user.dto.ts
import { IsEmail, IsOptional, MinLength } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { Role } from '../enums/role.enum';

@InputType({ description: 'Update user input' })
export class UpdateUserDto {
  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(8)
  password?: string;

  @Field(() => [Role], { nullable: true })
  @IsOptional()
  roles?: Role[];
}