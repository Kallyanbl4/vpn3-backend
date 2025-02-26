import { ObjectType, Field, ID, Float, GraphQLISODateTime } from '@nestjs/graphql';
import { PaymentStatus } from '../enums/payment-status.enum';

@ObjectType({ description: 'Result of a payment refund operation' })
export class RefundResult {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  paymentId: string;

  @Field(() => Float)
  amount: number;

  @Field()
  currency: string;

  @Field(() => PaymentStatus)
  paymentStatus: PaymentStatus;

  @Field()
  successful: boolean;

  @Field({ nullable: true })
  refundId?: string;

  @Field({ nullable: true })
  refundReason?: string;

  @Field(() => GraphQLISODateTime)
  processedAt: Date;

  @Field({ nullable: true })
  receiptUrl?: string;
}