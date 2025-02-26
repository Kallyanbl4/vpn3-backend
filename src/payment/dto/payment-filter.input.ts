import { InputType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { IsUUID, IsOptional, IsEnum, IsDate, IsString } from 'class-validator';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { Type } from 'class-transformer';

@InputType()
export class PaymentFilterInput {
  @Field(() => [PaymentStatus], { nullable: true })
  @IsOptional()
  @IsEnum(PaymentStatus, { each: true })
  statuses?: PaymentStatus[];

  @Field(() => [PaymentMethod], { nullable: true })
  @IsOptional()
  @IsEnum(PaymentMethod, { each: true })
  paymentMethods?: PaymentMethod[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  subscriptionId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  tariffPlanId?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateFrom?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateTo?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  searchTerm?: string;
}