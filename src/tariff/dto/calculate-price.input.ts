import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, IsNumber, Min, Max } from 'class-validator';

@InputType()
export class CalculateTariffPriceInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  tariffPlanId: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  @Max(365 * 5) // Максимум 5 лет
  durationDays: number;
}