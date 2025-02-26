import { InputType, PartialType } from '@nestjs/graphql';
import { CreateTariffPlanInput } from './create-tariff.dto';

@InputType()
export class UpdateTariffPlanInput extends PartialType(CreateTariffPlanInput) {}