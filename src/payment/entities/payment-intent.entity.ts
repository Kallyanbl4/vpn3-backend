import { ObjectType, Field, ID, Float, GraphQLISODateTime } from '@nestjs/graphql';
import { PaymentIntentStatus } from '../enums/payment-intent-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

@ObjectType({ description: 'Payment intent for initiating a payment' })
export class PaymentIntent {
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

  @Field(() => PaymentIntentStatus)
  status: PaymentIntentStatus;

  @Field(() => [PaymentMethod], { nullable: true })
  availablePaymentMethods?: PaymentMethod[];

  @Field({ nullable: true })
  description?: string;

  @Field(() => GraphQLISODateTime)
  expiresAt: Date;

  @Field()
  paymentUrl: string;

  @Field({ nullable: true })
  returnUrl?: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  // Для внутреннего использования, не экспортируется в GraphQL
  metadata?: Record<string, any>;
}