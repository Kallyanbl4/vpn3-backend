import { registerEnumType } from '@nestjs/graphql';

export enum TariffStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

registerEnumType(TariffStatus, {
  name: 'TariffStatus',
  description: 'Status of tariff plans',
});