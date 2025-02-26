import { registerEnumType } from '@nestjs/graphql';

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
  description: 'Status of a payment transaction',
});