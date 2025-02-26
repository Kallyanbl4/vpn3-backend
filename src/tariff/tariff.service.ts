import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TariffMapper } from './mappers/tariff.mapper';
import { CacheService } from '../common/cache/cache.service';
import { TariffPlan, TariffPriceCalculation, TariffComparisonResult } from './entities/tariff-plan.entity';
import { CreateTariffPlanInput } from './dto/create-tariff.dto';
import { UpdateTariffPlanInput } from './dto/update-tariff.dto';
import { TariffFilterInput } from './dto/tariff-filter.input';
import { PaginationInput } from './dto/pagination.input';
import { CalculateTariffPriceInput } from './dto/calculate-price.input';
import { CreateTemporaryTariffInput } from './dto/create-temporary-tariff.input';
import { TariffStatus } from './enums/tariff-status.enum';
import { TariffType } from './enums/tariff-type.enum';
import { BillingPeriod } from './enums/billing-period.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TariffService {
  private readonly logger = new Logger(TariffService.name);
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly TARIFF_CACHE_KEY = 'tariff_plans';

  constructor(
    private readonly prisma: PrismaService,
    private readonly tariffMapper: TariffMapper,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Создает новый тарифный план
   */
  async create(input: CreateTariffPlanInput): Promise<TariffPlan> {
    // Проверка на существование тарифа с таким кодом
    const existingTariff = await this.prisma.tariffPlan.findUnique({
      where: { code: input.code },
    });

    if (existingTariff) {
      this.logger.warn(`Attempted to create tariff with existing code: ${input.code}`);
      throw new ConflictException(`Tariff plan with code "${input.code}" already exists`);
    }

    // Валидация кастомного периода
    if (input.customPeriodEnabled) {
      if (!input.customPeriodMinDays || !input.customPeriodMaxDays || !input.customPeriodDailyPrice) {
        throw new BadRequestException('Custom period settings are required when custom period is enabled');
      }

      if (input.customPeriodMinDays > input.customPeriodMaxDays) {
        throw new BadRequestException('Minimum days must be less than or equal to maximum days');
      }
    }

    // Создание тарифного плана
    try {
      const createData = this.tariffMapper.toPrismaCreate(input);
      const prismaResult = await this.prisma.tariffPlan.create({
        data: createData,
      });

      const result = this.tariffMapper.toDomain(prismaResult);
      
      // Инвалидируем кэш
      await this.invalidateCache();
      
      this.logger.log(`Tariff plan created: ${result.name} (${result.code})`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create tariff plan: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Создает временный тарифный план
   */
  async createTemporary(input: CreateTemporaryTariffInput): Promise<TariffPlan> {
    // Генерируем уникальный код для временного тарифа
    const code = `TEMP-${uuidv4().substring(0, 8)}`;
    
    const createInput: CreateTariffPlanInput = {
      code,
      name: input.name,
      features: input.features,
      priceDaily: input.price / input.durationDays, // Цена за день
      availableBillingPeriods: [BillingPeriod.CUSTOM],
      customPeriodEnabled: true,
      customPeriodMinDays: input.durationDays,
      customPeriodMaxDays: input.durationDays,
      customPeriodDailyPrice: input.price / input.durationDays,
      type: TariffType.TEMPORARY,
      status: TariffStatus.ACTIVE,
      limits: input.limits,
    };

    return this.create(createInput);
  }

  /**
   * Находит все тарифные планы с фильтрацией и пагинацией
   */
  async findAll(filter?: TariffFilterInput, pagination?: PaginationInput): Promise<TariffPlan[]> {
    // Кэширование только для запросов без фильтра и с базовой пагинацией
    const isDefaultQuery = 
      !filter && 
      (!pagination || (pagination.skip === 0 && pagination.take === 10));

    if (isDefaultQuery) {
      const cachedTariffs = await this.getCachedTariffs();
      if (cachedTariffs && cachedTariffs.length > 0) {
        return cachedTariffs;
      }
    }

    // Формируем условия поиска
    const where = this.buildFilterWhereClause(filter);

    // Получаем данные из БД
    const tariffPlans = await this.prisma.tariffPlan.findMany({
      where,
      skip: pagination?.skip || 0,
      take: pagination?.take || 10,
      orderBy: { createdAt: 'desc' },
    });

    const result = this.tariffMapper.toDomainList(tariffPlans);

    // Кэшируем результаты базового запроса
    if (isDefaultQuery) {
      await this.cacheTariffs(result);
    }

    return result;
  }

  /**
   * Находит тарифный план по ID
   */
  async findById(id: string): Promise<TariffPlan> {
    const tariffPlan = await this.prisma.tariffPlan.findUnique({
      where: { id },
    });

    if (!tariffPlan) {
      throw new NotFoundException(`Tariff plan with ID "${id}" not found`);
    }

    return this.tariffMapper.toDomain(tariffPlan);
  }

  /**
   * Находит активные тарифные планы
   */
  async findActiveTariffs(): Promise<TariffPlan[]> {
    const cachedResult = await this.cacheService.get<TariffPlan[]>(
      `${this.TARIFF_CACHE_KEY}:active`
    );

    if (cachedResult) {
      return cachedResult;
    }

    const activeTariffs = await this.prisma.tariffPlan.findMany({
      where: { status: TariffStatus.ACTIVE },
      orderBy: [
        { type: 'asc' },
        { priceMonthly: 'asc' },
      ],
    });

    const result = this.tariffMapper.toDomainList(activeTariffs);

    await this.cacheService.set(
      `${this.TARIFF_CACHE_KEY}:active`,
      result,
      this.CACHE_TTL
    );

    return result;
  }

  /**
   * Обновляет тарифный план
   */
  async update(id: string, input: UpdateTariffPlanInput): Promise<TariffPlan> {
    // Проверяем существование тарифа
    await this.findById(id);

    // Проверка на конфликт кодов
    if (input.code) {
      const existingTariff = await this.prisma.tariffPlan.findFirst({
        where: { 
          code: input.code,
          id: { not: id },
        },
      });

      if (existingTariff) {
        throw new ConflictException(`Tariff plan with code "${input.code}" already exists`);
      }
    }

    // Валидация кастомного периода
    if (input.customPeriodEnabled) {
      // Получаем текущий тариф для проверки
      const currentTariff = await this.findById(id);
      
      const minDays = input.customPeriodMinDays ?? currentTariff.customPeriodMinDays;
      const maxDays = input.customPeriodMaxDays ?? currentTariff.customPeriodMaxDays;
      const dailyPrice = input.customPeriodDailyPrice ?? currentTariff.customPeriodDailyPrice;

      if (!minDays || !maxDays || !dailyPrice) {
        throw new BadRequestException('Custom period settings are required when custom period is enabled');
      }

      if (minDays > maxDays) {
        throw new BadRequestException('Minimum days must be less than or equal to maximum days');
      }
    }

    // Обновляем тарифный план
    try {
      const updateData = this.tariffMapper.toPrismaUpdate(input);
      const prismaResult = await this.prisma.tariffPlan.update({
        where: { id },
        data: updateData,
      });

      const result = this.tariffMapper.toDomain(prismaResult);
      
      // Инвалидируем кэш
      await this.invalidateCache();
      
      this.logger.log(`Tariff plan updated: ${result.name} (${result.code})`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update tariff plan: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Изменяет статус тарифного плана
   */
  async changeStatus(id: string, status: TariffStatus): Promise<TariffPlan> {
    // Проверяем существование тарифа
    await this.findById(id);

    // Обновляем статус тарифа
    try {
      const prismaResult = await this.prisma.tariffPlan.update({
        where: { id },
        data: { status },
      });

      const result = this.tariffMapper.toDomain(prismaResult);
      
      // Инвалидируем кэш
      await this.invalidateCache();
      
      this.logger.log(`Tariff plan status changed to ${status}: ${result.name} (${result.code})`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to change tariff plan status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Сравнивает тарифные планы
   */
  async compareTariffs(ids: string[]): Promise<TariffComparisonResult> {
    if (ids.length < 2) {
      throw new BadRequestException('At least two tariff plans must be provided for comparison');
    }

    // Получаем тарифные планы
    const tariffPromises = ids.map(id => this.findById(id));
    const tariffs = await Promise.all(tariffPromises);

    // Собираем все возможные фичи из тарифов
    const allFeatures = new Set<string>();
    tariffs.forEach(tariff => {
      tariff.features.forEach(feature => allFeatures.add(feature));
    });

    return {
      tariffs,
      comparedFeatures: Array.from(allFeatures),
    };
  }

  /**
   * Рассчитывает стоимость тарифа для указанного периода
   */
  async calculatePrice(input: CalculateTariffPriceInput): Promise<TariffPriceCalculation> {
    const tariff = await this.findById(input.tariffPlanId);

    // Проверяем, что тариф активен
    if (tariff.status !== TariffStatus.ACTIVE) {
      throw new BadRequestException('Cannot calculate price for inactive tariff');
    }

    // Определяем тип биллинга и стоимость
    let billingPeriod: BillingPeriod;
    let originalPrice: number;
    let finalPrice: number;
    let hasDiscount = false;
    let discountPercentage: number | undefined;

    const { durationDays } = input;

    // Кастомный период
    if (tariff.customPeriodEnabled &&
        durationDays >= (tariff.customPeriodMinDays || 1) &&
        durationDays <= (tariff.customPeriodMaxDays || 365)) {
      billingPeriod = BillingPeriod.CUSTOM;
      originalPrice = durationDays * (tariff.customPeriodDailyPrice || 0);
      finalPrice = originalPrice;
    }
    // Ежедневный
    else if (durationDays <= 7 && tariff.priceDaily) {
      billingPeriod = BillingPeriod.DAY;
      originalPrice = durationDays * tariff.priceDaily;
      finalPrice = originalPrice;
    }
    // Недельный
    else if (durationDays <= 30 && tariff.availableBillingPeriods.includes(BillingPeriod.WEEK)) {
      billingPeriod = BillingPeriod.WEEK;
      const weeks = Math.ceil(durationDays / 7);
      originalPrice = weeks * (tariff.priceDaily || 0) * 7;
      finalPrice = originalPrice;
    }
    // Месячный
    else if (durationDays <= 90 && tariff.priceMonthly) {
      billingPeriod = BillingPeriod.MONTH;
      const months = Math.ceil(durationDays / 30);
      originalPrice = months * tariff.priceMonthly;
      finalPrice = originalPrice;
    }
    // Квартальный
    else if (durationDays <= 365 && tariff.priceQuarterly) {
      billingPeriod = BillingPeriod.QUARTER;
      const quarters = Math.ceil(durationDays / 90);
      originalPrice = quarters * tariff.priceQuarterly;
      
      // Рассчитываем стоимость при месячной оплате для сравнения
      const monthlyPrice = Math.ceil(durationDays / 30) * (tariff.priceMonthly || 0);
      
      // Если квартальная оплата выгоднее, применяем скидку
      if (originalPrice < monthlyPrice && tariff.priceMonthly) {
        hasDiscount = true;
        discountPercentage = Math.round((1 - originalPrice / monthlyPrice) * 100);
      }
      
      finalPrice = originalPrice;
    }
    // Годовой
    else if (tariff.priceAnnually) {
      billingPeriod = BillingPeriod.YEAR;
      const years = Math.ceil(durationDays / 365);
      originalPrice = years * tariff.priceAnnually;
      
      // Рассчитываем стоимость при месячной оплате для сравнения
      const monthlyPrice = Math.ceil(durationDays / 30) * (tariff.priceMonthly || 0);
      
      // Если годовая оплата выгоднее, применяем скидку
      if (originalPrice < monthlyPrice && tariff.priceMonthly) {
        hasDiscount = true;
        discountPercentage = Math.round((1 - originalPrice / monthlyPrice) * 100);
      }
      
      finalPrice = originalPrice;
    }
    else {
      throw new BadRequestException('Cannot calculate price for the given duration');
    }

    return {
      tariff,
      durationDays,
      billingPeriod,
      originalPrice,
      finalPrice,
      hasDiscount,
      discountPercentage,
    };
  }

  /**
   * Формирует условия запроса для фильтрации
   */
  private buildFilterWhereClause(filter?: TariffFilterInput): any {
    if (!filter) return {};

    const where: any = {};
    
    if (filter.types && filter.types.length > 0) {
      where.type = { in: filter.types };
    }
    
    if (filter.statuses && filter.statuses.length > 0) {
      where.status = { in: filter.statuses };
    }
    
    if (filter.billingPeriods && filter.billingPeriods.length > 0) {
      // Используем hasSome для проверки, что некоторые из указанных периодов 
      // поддерживаются тарифом
      where.availableBillingPeriods = {
        hasSome: filter.billingPeriods.map(p => p.toString()),
      };
    }
    
    if (filter.searchTerm) {
      where.OR = [
        { name: { contains: filter.searchTerm, mode: 'insensitive' } },
        { description: { contains: filter.searchTerm, mode: 'insensitive' } },
        { code: { contains: filter.searchTerm, mode: 'insensitive' } },
      ];
    }
    
    if (filter.customPeriodEnabled !== undefined) {
      where.customPeriodEnabled = filter.customPeriodEnabled;
    }
    
    return where;
  }

  /**
   * Получает кэшированные тарифы
   */
  private async getCachedTariffs(): Promise<TariffPlan[] | null> {
    return this.cacheService.get<TariffPlan[]>(this.TARIFF_CACHE_KEY);
  }

  /**
   * Кэширует тарифы
   */
  private async cacheTariffs(tariffs: TariffPlan[]): Promise<void> {
    await this.cacheService.set(this.TARIFF_CACHE_KEY, tariffs, this.CACHE_TTL);
  }

  /**
   * Инвалидирует кэш тарифов
   */
  private async invalidateCache(): Promise<void> {
    await this.cacheService.del(this.TARIFF_CACHE_KEY);
    await this.cacheService.del(`${this.TARIFF_CACHE_KEY}:active`);
  }
}