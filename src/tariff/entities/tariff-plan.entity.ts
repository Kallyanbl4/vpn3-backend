import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { TariffType } from '../enums/tariff-type.enum';
import { TariffStatus } from '../enums/tariff-status.enum';
import { BillingPeriod } from '../enums/billing-period.enum';

@ObjectType({ description: 'Tariff limits' })
export class TariffLimits {
  @Field(() => Int)
  devicesCount: number;

  @Field(() => Int, { nullable: true })
  bandwidth?: number;

  @Field(() => Int, { nullable: true })
  dataLimit?: number;
}

@ObjectType({ description: 'Tariff plan model' })
export class TariffPlan {
  @Field(() => ID)
  id: string;

  @Field()
  code: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String])
  features: string[];

  @Field(() => Float, { nullable: true })
  priceDaily?: number;

  @Field(() => Float, { nullable: true })
  priceMonthly?: number;

  @Field(() => Float, { nullable: true })
  priceQuarterly?: number;

  @Field(() => Float, { nullable: true })
  priceAnnually?: number;

  @Field(() => [BillingPeriod])
  availableBillingPeriods: BillingPeriod[];

  @Field(() => Boolean)
  customPeriodEnabled: boolean;

  @Field(() => Int, { nullable: true })
  customPeriodMinDays?: number;

  @Field(() => Int, { nullable: true })
  customPeriodMaxDays?: number;

  @Field(() => Float, { nullable: true })
  customPeriodDailyPrice?: number;

  @Field(() => TariffType)
  type: TariffType;

  @Field(() => TariffStatus)
  status: TariffStatus;

  @Field(() => TariffLimits)
  limits: TariffLimits;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType({ description: 'Tariff comparison result' })
export class TariffComparisonResult {
  @Field(() => [TariffPlan])
  tariffs: TariffPlan[];

  @Field(() => [String])
  comparedFeatures: string[];
}

@ObjectType({ description: 'Tariff price calculation result' })
export class TariffPriceCalculation {
  @Field(() => TariffPlan)
  tariff: TariffPlan;

  @Field(() => Int)
  durationDays: number;

  @Field(() => BillingPeriod)
  billingPeriod: BillingPeriod;

  @Field(() => Float)
  originalPrice: number;

  @Field(() => Float)
  finalPrice: number;

  @Field(() => Boolean)
  hasDiscount: boolean;

  @Field(() => Float, { nullable: true })
  discountPercentage?: number;
}