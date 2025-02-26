import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, Max, ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
class TemporaryTariffLimitsInput {
  @Field(() => Int)
  @IsNumber()
  @Min(1)
  devicesCount: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  bandwidth?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  dataLimit?: number;
}

@InputType()
export class CreateTemporaryTariffInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  @Max(90) // Максимум 90 дней для временного тарифа
  durationDays: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price: number;

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  features: string[];

  @Field(() => TemporaryTariffLimitsInput)
  @ValidateNested()
  @Type(() => TemporaryTariffLimitsInput)
  limits: TemporaryTariffLimitsInput;
}