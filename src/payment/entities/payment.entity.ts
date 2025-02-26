import { ObjectType, Field, ID, Float, GraphQLISODateTime } from '@nestjs/graphql';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { BillingPeriod } from '../../tariff/enums/billing-period.enum';

@ObjectType({ description: 'Payment transaction details' })
export class Payment {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => ID, { nullable: true })
  subscriptionId?: string;

  @Field(() => ID, { nullable: true })
  tariffPlanId?: string;

  @Field(() => Float)
  amount: number;

  @Field()
  currency: string;

  @Field(() => PaymentStatus)
  status: PaymentStatus;

  @Field(() => PaymentMethod, { nullable: true })
  paymentMethod?: PaymentMethod;

  @Field(() => BillingPeriod, { nullable: true })
  periodType?: BillingPeriod;

  @Field(() => Number, { nullable: true })
  periodDays?: number;

  @Field({ nullable: true })
  externalId?: string;

  @Field({ nullable: true })
  invoiceUrl?: string;

  @Field({ nullable: true })
  receiptUrl?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  // Для внутреннего использования, не экспортируется в GraphQL
  metadata?: Record<string, any>;
}