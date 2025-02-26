import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  skip: number = 0;

  @Field(() => Int, { defaultValue: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  take: number = 10;
}