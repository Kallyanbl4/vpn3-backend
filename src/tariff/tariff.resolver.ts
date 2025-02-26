import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TariffService } from './tariff.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../user/enums/role.enum';
import { TariffPlan, TariffPriceCalculation, TariffComparisonResult } from './entities/tariff-plan.entity';
import { CreateTariffPlanInput } from './dto/create-tariff.dto';
import { UpdateTariffPlanInput } from './dto/update-tariff.dto';
import { TariffFilterInput } from './dto/tariff-filter.input';
import { PaginationInput } from './dto/pagination.input';
import { CalculateTariffPriceInput } from './dto/calculate-price.input';
import { CreateTemporaryTariffInput } from './dto/create-temporary-tariff.input';
import { TariffStatus } from './enums/tariff-status.enum';

@Resolver(() => TariffPlan)
export class TariffResolver {
  constructor(private readonly tariffService: TariffService) {}

  /**
   * Получение списка всех тарифных планов (с фильтрацией и пагинацией)
   */
  @Query(() => [TariffPlan], { name: 'tariffPlans', description: 'Get all tariff plans with filtering and pagination' })
  @UseGuards(GqlAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async getTariffPlans(
    @Args('filter', { nullable: true }) filter?: TariffFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<TariffPlan[]> {
    return this.tariffService.findAll(filter, pagination);
  }

  /**
   * Получение информации о конкретном тарифном плане по ID
   */
  @Query(() => TariffPlan, { name: 'tariffPlan', description: 'Get tariff plan by ID' })
  async getTariffPlan(@Args('id', { type: () => ID }) id: string): Promise<TariffPlan> {
    return this.tariffService.findById(id);
  }

  /**
   * Получение активных тарифных планов
   */
  @Query(() => [TariffPlan], { name: 'activeTariffPlans', description: 'Get all active tariff plans' })
  async getActiveTariffPlans(): Promise<TariffPlan[]> {
    return this.tariffService.findActiveTariffs();
  }

  /**
   * Сравнение нескольких тарифных планов
   */
  @Query(() => TariffComparisonResult, { name: 'compareTariffs', description: 'Compare multiple tariff plans' })
  async compareTariffs(
    @Args('ids', { type: () => [ID] }) ids: string[],
  ): Promise<TariffComparisonResult> {
    return this.tariffService.compareTariffs(ids);
  }

  /**
   * Расчет стоимости тарифа на указанный период
   */
  @Query(() => TariffPriceCalculation, { name: 'calculateTariffPrice', description: 'Calculate tariff price for a specific duration' })
  async calculateTariffPrice(
    @Args('input') input: CalculateTariffPriceInput,
  ): Promise<TariffPriceCalculation> {
    return this.tariffService.calculatePrice(input);
  }

  /**
   * Создание нового тарифного плана (только для администраторов)
   */
  @Mutation(() => TariffPlan, { name: 'createTariffPlan', description: 'Create a new tariff plan (Admin only)' })
  @UseGuards(GqlAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async createTariffPlan(
    @Args('input') input: CreateTariffPlanInput,
  ): Promise<TariffPlan> {
    return this.tariffService.create(input);
  }

  /**
   * Обновление существующего тарифного плана (только для администраторов)
   */
  @Mutation(() => TariffPlan, { name: 'updateTariffPlan', description: 'Update an existing tariff plan (Admin only)' })
  @UseGuards(GqlAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async updateTariffPlan(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTariffPlanInput,
  ): Promise<TariffPlan> {
    return this.tariffService.update(id, input);
  }

  /**
   * Изменение статуса тарифного плана (только для администраторов)
   */
  @Mutation(() => TariffPlan, { name: 'changeTariffStatus', description: 'Change tariff plan status (Admin only)' })
  @UseGuards(GqlAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async changeTariffStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => TariffStatus }) status: TariffStatus,
  ): Promise<TariffPlan> {
    return this.tariffService.changeStatus(id, status);
  }

  /**
   * Создание временного тарифного плана (только для администраторов)
   */
  @Mutation(() => TariffPlan, { name: 'createTemporaryTariff', description: 'Create a temporary tariff plan (Admin only)' })
  @UseGuards(GqlAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async createTemporaryTariff(
    @Args('input') input: CreateTemporaryTariffInput,
  ): Promise<TariffPlan> {
    return this.tariffService.createTemporary(input);
  }
}