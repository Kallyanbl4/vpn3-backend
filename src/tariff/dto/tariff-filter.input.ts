import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { TariffType } from '../enums/tariff-type.enum';
import { TariffStatus } from '../enums/tariff-status.enum';
import { BillingPeriod } from '../enums/billing-period.enum';

@InputType()
export class TariffFilterInput {
  @Field(() => [TariffType], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(TariffType, { each: true })
  types?: TariffType[];

  @Field(() => [TariffStatus], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(TariffStatus, { each: true })
  statuses?: TariffStatus[];

  @Field(() => [BillingPeriod], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(BillingPeriod, { each: true })
  billingPeriods?: BillingPeriod[];

  @Field({ nullable: true })
  @IsOptional()
  searchTerm?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  customPeriodEnabled?: boolean;
}