import { registerEnumType } from '@nestjs/graphql';

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CRYPTO = 'CRYPTO',
  PAYPAL = 'PAYPAL',
  APPLE_PAY = 'APPLE_PAY',
  GOOGLE_PAY = 'GOOGLE_PAY',
  TELEGRAM = 'TELEGRAM',
}

registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
  description: 'Available payment methods',
});