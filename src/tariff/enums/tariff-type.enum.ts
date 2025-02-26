import { registerEnumType } from '@nestjs/graphql';

export enum TariffType {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  BUSINESS = 'BUSINESS',
  TEMPORARY = 'TEMPORARY',
}

registerEnumType(TariffType, {
  name: 'TariffType',
  description: 'Types of tariff plans',
});