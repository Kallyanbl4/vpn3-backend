import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsEnum, IsArray, IsNumber, IsOptional, Min, Max, IsBoolean, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { TariffType } from '../enums/tariff-type.enum';
import { TariffStatus } from '../enums/tariff-status.enum';
import { BillingPeriod } from '../enums/billing-period.enum';

@InputType()
class TariffLimitsInput {
  @Field(() => Int)
  @IsNumber()
  @Min(1)
  devicesCount: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  bandwidth?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  dataLimit?: number;
}

@InputType()
export class CreateTariffPlanInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  code: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  features: string[];

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceDaily?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceMonthly?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceQuarterly?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceAnnually?: number;

  @Field(() => [BillingPeriod])
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(BillingPeriod, { each: true })
  availableBillingPeriods: BillingPeriod[];

  @Field(() => Boolean)
  @IsBoolean()
  customPeriodEnabled: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  customPeriodMinDays?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  customPeriodMaxDays?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customPeriodDailyPrice?: number;

  @Field(() => TariffType)
  @IsEnum(TariffType)
  type: TariffType;

  @Field(() => TariffStatus, { defaultValue: TariffStatus.DRAFT })
  @IsEnum(TariffStatus)
  @IsOptional()
  status?: TariffStatus;

  @Field(() => TariffLimitsInput)
  @ValidateNested()
  @Type(() => TariffLimitsInput)
  limits: TariffLimitsInput;
}