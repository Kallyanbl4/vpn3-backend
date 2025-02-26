import { InputType, Field, ID, Float } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

@InputType()
export class RefundPaymentInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  paymentId: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  fullRefund?: boolean = false;
}