import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty, IsJSON, IsEnum } from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class ProcessPaymentInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  paymentIntentId: string;

  @Field(() => PaymentMethod)
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @Field(() => GraphQLJSON)
  @IsJSON()
  paymentData: Record<string, any>;
}