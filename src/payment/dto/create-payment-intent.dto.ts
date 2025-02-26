import { InputType, Field, ID, Float } from '@nestjs/graphql';
import { IsUUID, IsNumber, IsOptional, IsString, Min, IsEnum, IsUrl, ArrayMinSize } from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';

@InputType()
export class CreatePaymentIntentInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  subscriptionId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  tariffPlanId?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @Field({ defaultValue: 'USD' })
  @IsString()
  currency: string = 'USD';

  @Field(() => [PaymentMethod], { nullable: true })
  @IsOptional()
  @IsEnum(PaymentMethod, { each: true })
  @ArrayMinSize(1)
  preferredPaymentMethods?: PaymentMethod[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  returnUrl?: string;
}