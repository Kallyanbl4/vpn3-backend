import { Injectable } from '@nestjs/common';
import { TariffPlan, TariffLimits } from '../entities/tariff-plan.entity';
import { TariffType } from '../enums/tariff-type.enum';
import { TariffStatus } from '../enums/tariff-status.enum';
import { BillingPeriod } from '../enums/billing-period.enum';
import { Prisma } from '@prisma/client';

@Injectable()
export class TariffMapper {
  /**
   * Преобразует Prisma модель в доменную модель
   */
  toDomain(prismaTariffPlan: any): TariffPlan {
    const {
      id,
      code,
      name,
      description,
      features,
      priceDaily,
      priceMonthly,
      priceQuarterly,
      priceAnnually,
      availableBillingPeriods,
      customPeriodEnabled,
      customPeriodMinDays,
      customPeriodMaxDays,
      customPeriodDailyPrice,
      type,
      status,
      limits,
      createdAt,
      updatedAt
    } = prismaTariffPlan;

    const tariffPlan = new TariffPlan();
    tariffPlan.id = id;
    tariffPlan.code = code;
    tariffPlan.name = name;
    tariffPlan.description = description || undefined;
    tariffPlan.features = this.parseJsonToArray(features);
    tariffPlan.priceDaily = priceDaily || undefined;
    tariffPlan.priceMonthly = priceMonthly || undefined;
    tariffPlan.priceQuarterly = priceQuarterly || undefined;
    tariffPlan.priceAnnually = priceAnnually || undefined;
    tariffPlan.availableBillingPeriods = this.parseStringArrayToEnum(availableBillingPeriods as string[], BillingPeriod);
    tariffPlan.customPeriodEnabled = customPeriodEnabled;
    tariffPlan.customPeriodMinDays = customPeriodMinDays || undefined;
    tariffPlan.customPeriodMaxDays = customPeriodMaxDays || undefined;
    tariffPlan.customPeriodDailyPrice = customPeriodDailyPrice || undefined;
    tariffPlan.type = type as TariffType;
    tariffPlan.status = status as TariffStatus;
    tariffPlan.limits = this.parseLimits(limits);
    tariffPlan.createdAt = createdAt;
    tariffPlan.updatedAt = updatedAt;

    return tariffPlan;
  }

  /**
   * Преобразует доменную модель в Prisma модель для создания
   */
  toPrismaCreate(tariffPlan: Partial<TariffPlan>): any {
    return {
      code: tariffPlan.code,
      name: tariffPlan.name,
      description: tariffPlan.description,
      features: this.arrayToJson(tariffPlan.features || []),
      priceDaily: tariffPlan.priceDaily,
      priceMonthly: tariffPlan.priceMonthly,
      priceQuarterly: tariffPlan.priceQuarterly,
      priceAnnually: tariffPlan.priceAnnually,
      availableBillingPeriods: this.enumArrayToStringArray(tariffPlan.availableBillingPeriods || []),
      customPeriodEnabled: tariffPlan.customPeriodEnabled,
      customPeriodMinDays: tariffPlan.customPeriodMinDays,
      customPeriodMaxDays: tariffPlan.customPeriodMaxDays,
      customPeriodDailyPrice: tariffPlan.customPeriodDailyPrice,
      type: tariffPlan.type,
      status: tariffPlan.status || TariffStatus.DRAFT,
      limits: this.limitsToJson(tariffPlan.limits || { devicesCount: 1 }),
    };
  }

  /**
   * Преобразует доменную модель в Prisma модель для обновления
   */
  toPrismaUpdate(tariffPlan: Partial<TariffPlan>): any {
    const updateData: any = {};

    if (tariffPlan.code !== undefined) updateData.code = tariffPlan.code;
    if (tariffPlan.name !== undefined) updateData.name = tariffPlan.name;
    if (tariffPlan.description !== undefined) updateData.description = tariffPlan.description;
    if (tariffPlan.features !== undefined) updateData.features = this.arrayToJson(tariffPlan.features);
    if (tariffPlan.priceDaily !== undefined) updateData.priceDaily = tariffPlan.priceDaily;
    if (tariffPlan.priceMonthly !== undefined) updateData.priceMonthly = tariffPlan.priceMonthly;
    if (tariffPlan.priceQuarterly !== undefined) updateData.priceQuarterly = tariffPlan.priceQuarterly;
    if (tariffPlan.priceAnnually !== undefined) updateData.priceAnnually = tariffPlan.priceAnnually;
    if (tariffPlan.availableBillingPeriods !== undefined) updateData.availableBillingPeriods = this.enumArrayToStringArray(tariffPlan.availableBillingPeriods);
    if (tariffPlan.customPeriodEnabled !== undefined) updateData.customPeriodEnabled = tariffPlan.customPeriodEnabled;
    if (tariffPlan.customPeriodMinDays !== undefined) updateData.customPeriodMinDays = tariffPlan.customPeriodMinDays;
    if (tariffPlan.customPeriodMaxDays !== undefined) updateData.customPeriodMaxDays = tariffPlan.customPeriodMaxDays;
    if (tariffPlan.customPeriodDailyPrice !== undefined) updateData.customPeriodDailyPrice = tariffPlan.customPeriodDailyPrice;
    if (tariffPlan.type !== undefined) updateData.type = tariffPlan.type;
    if (tariffPlan.status !== undefined) updateData.status = tariffPlan.status;
    if (tariffPlan.limits !== undefined) updateData.limits = this.limitsToJson(tariffPlan.limits);

    return updateData;
  }

  /**
   * Преобразует список моделей Prisma в список доменных моделей
   */
  toDomainList(prismaTariffPlans: any[]): TariffPlan[] {
    return prismaTariffPlans.map(plan => this.toDomain(plan));
  }

  /**
   * Преобразует JSON лимитов в доменную модель
   */
  private parseLimits(limitsJson: any): TariffLimits {
    const limits = typeof limitsJson === 'string' 
      ? JSON.parse(limitsJson) 
      : limitsJson;
    
    const result = new TariffLimits();
    result.devicesCount = limits.devicesCount;
    result.bandwidth = limits.bandwidth;
    result.dataLimit = limits.dataLimit;
    
    return result;
  }

  /**
   * Преобразует лимиты в JSON
   */
  private limitsToJson(limits: TariffLimits): any {
    return limits ? JSON.stringify(limits) : JSON.stringify({ devicesCount: 1 });
  }

  /**
   * Преобразует JSON массив в обычный массив
   */
  private parseJsonToArray(json: any): string[] {
    if (!json) return [];
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    return Array.isArray(data) ? data : [];
  }

  /**
   * Преобразует массив строк в массив перечислений
   */
  private parseStringArrayToEnum<T>(arr: string[], enumType: any): T[] {
    if (!arr || !Array.isArray(arr)) return [];
    return arr.map(item => enumType[item]) as T[];
  }

  /**
   * Преобразует массив перечислений в массив строк
   */
  private enumArrayToStringArray<T>(arr: T[]): string[] {
    if (!arr || !Array.isArray(arr)) return [];
    return arr.map(item => String(item));
  }

  /**
   * Преобразует массив в JSON
   */
  private arrayToJson(arr: any[]): any {
    return arr && Array.isArray(arr) ? JSON.stringify(arr) : JSON.stringify([]);
  }
}