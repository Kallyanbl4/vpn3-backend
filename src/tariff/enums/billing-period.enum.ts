import { registerEnumType } from '@nestjs/graphql';

export enum BillingPeriod {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
  CUSTOM = 'CUSTOM',
}

registerEnumType(BillingPeriod, {
  name: 'BillingPeriod',
  description: 'Available billing periods for tariff plans',
});