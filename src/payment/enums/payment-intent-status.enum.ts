import { registerEnumType } from '@nestjs/graphql';

export enum PaymentIntentStatus {
  CREATED = 'CREATED',
  PROCESSING = 'PROCESSING',
  REQUIRES_CONFIRMATION = 'REQUIRES_CONFIRMATION',
  REQUIRES_PAYMENT_METHOD = 'REQUIRES_PAYMENT_METHOD',
  REQUIRES_ACTION = 'REQUIRES_ACTION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

registerEnumType(PaymentIntentStatus, {
  name: 'PaymentIntentStatus',
  description: 'Status of a payment intent',
});